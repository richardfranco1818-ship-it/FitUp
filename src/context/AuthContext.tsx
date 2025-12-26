import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  observarAuth,
  obtenerPerfil,
  UserProfile,
  cerrarSesion,
} from "../services/authService";
import { storageService } from "../services/storageService";

// Claves para AsyncStorage
const AUTH_STORAGE_KEYS = {
  USER_DATA: "@fitup_user_data",
  USER_PROFILE: "@fitup_user_profile",
};

// Tipo simplificado de usuario para guardar offline
interface OfflineUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | OfflineUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isOffline: boolean;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | OfflineUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Guardar sesión en AsyncStorage
  const saveSessionLocally = async (firebaseUser: User, userProfile: UserProfile | null) => {
    try {
      const offlineUser: OfflineUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
      };
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(offlineUser));
      
      if (userProfile) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
      }
      
      console.log("[AuthContext] Sesión guardada localmente");
    } catch (error) {
      console.error("[AuthContext] Error guardando sesión:", error);
    }
  };

  // Cargar sesión desde AsyncStorage
  const loadLocalSession = async (): Promise<{ user: OfflineUser | null; profile: UserProfile | null }> => {
    try {
      const userDataString = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
      const profileString = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_PROFILE);
      
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const profileData = profileString ? JSON.parse(profileString) : null;
      
      return { user: userData, profile: profileData };
    } catch (error) {
      console.error("[AuthContext] Error cargando sesión local:", error);
      return { user: null, profile: null };
    }
  };

  // Limpiar sesión local
  const clearLocalSession = async () => {
    try {
      await AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.USER_DATA,
        AUTH_STORAGE_KEYS.USER_PROFILE,
      ]);
      console.log("[AuthContext] Sesión local eliminada");
    } catch (error) {
      console.error("[AuthContext] Error limpiando sesión:", error);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      // Primero, verificar si hay conexión
      const isOnline = await storageService.isOnline();
      
      if (!isOnline) {
        // SIN CONEXIÓN: Cargar sesión local
        console.log("[AuthContext] Sin conexión - cargando sesión local");
        const localSession = await loadLocalSession();
        
        if (localSession.user) {
          setUser(localSession.user);
          setProfile(localSession.profile);
          setIsOffline(true);
          console.log("[AuthContext] Sesión offline cargada:", localSession.user.email);
        }
        
        setLoading(false);
        
        // Aún así intentar escuchar cambios de auth para cuando vuelva la conexión
        unsubscribe = observarAuth(async (firebaseUser) => {
          if (firebaseUser) {
            setUser(firebaseUser);
            setIsOffline(false);
            const userProfile = await obtenerPerfil(firebaseUser.uid);
            setProfile(userProfile);
            await saveSessionLocally(firebaseUser, userProfile);
          }
        });
        
      } else {
        // CON CONEXIÓN: Flujo normal de Firebase
        console.log("[AuthContext] Con conexión - usando Firebase Auth");
        
        unsubscribe = observarAuth(async (firebaseUser) => {
          setUser(firebaseUser);
          setIsOffline(false);
          
          if (firebaseUser) {
            const userProfile = await obtenerPerfil(firebaseUser.uid);
            setProfile(userProfile);
            // Guardar sesión para uso offline
            await saveSessionLocally(firebaseUser, userProfile);
          } else {
            setProfile(null);
            // Si no hay usuario de Firebase, intentar cargar sesión local
            const localSession = await loadLocalSession();
            if (localSession.user) {
              setUser(localSession.user);
              setProfile(localSession.profile);
              setIsOffline(true);
            }
          }
          
          setLoading(false);
        });
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    try {
      // Intentar cerrar sesión en Firebase (si hay conexión)
      const isOnline = await storageService.isOnline();
      if (isOnline) {
        await cerrarSesion();
      }
    } catch (error) {
      console.log("[AuthContext] Error cerrando sesión Firebase (puede ser offline):", error);
    }
    
    // Siempre limpiar datos locales
    await clearLocalSession();
    setUser(null);
    setProfile(null);
    setIsOffline(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isOffline, setProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};