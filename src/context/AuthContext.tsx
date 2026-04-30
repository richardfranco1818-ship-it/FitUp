// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { obtenerPerfil, cerrarSesion, UserProfile } from '../services/authService';
import { storageService } from '../services/storageService';

const AUTH_STORAGE_KEYS = {
  USER_DATA: '@fitup_user_data',
  USER_PROFILE: '@fitup_user_profile',
};

interface OfflineUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isOffline: boolean;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // ── Guardar sesión local ───────────────────────────────────
  const saveSessionLocally = async (supabaseUser: any, userProfile: UserProfile | null) => {
    try {
      const offlineUser: OfflineUser = { uid: supabaseUser.id, email: supabaseUser.email };
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(offlineUser));
      if (userProfile) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error('[AuthContext] Error guardando sesión:', error);
    }
  };

  // ── Cargar sesión local (modo offline) ────────────────────
  const loadLocalSession = async (): Promise<{ user: OfflineUser | null; profile: UserProfile | null }> => {
    try {
      const userStr    = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
      const profileStr = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_PROFILE);
      return {
        user:    userStr    ? JSON.parse(userStr)    : null,
        profile: profileStr ? JSON.parse(profileStr) : null,
      };
    } catch {
      return { user: null, profile: null };
    }
  };

  const clearLocalSession = async () => {
    await AsyncStorage.multiRemove([AUTH_STORAGE_KEYS.USER_DATA, AUTH_STORAGE_KEYS.USER_PROFILE]);
  };

  // ── Inicializar auth ───────────────────────────────────────
  useEffect(() => {
    // Escuchar cambios de sesión de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const supabaseUser = session.user;

        // Normalizar el user para que tenga .uid (compatible con el resto de la app)
        const normalizedUser = { ...supabaseUser, uid: supabaseUser.id };
        setUser(normalizedUser);

        const isOnline = await storageService.isOnline();
        if (isOnline) {
          const userProfile = await obtenerPerfil(supabaseUser.id);
          setProfile(userProfile);
          await saveSessionLocally(supabaseUser, userProfile);
          setIsOffline(false);
        }
      } else {
        // Sin sesión activa — intentar modo offline
        const local = await loadLocalSession();
        if (local.user) {
          setUser({ ...local.user, uid: local.user.uid });
          setProfile(local.profile);
          setIsOffline(true);
        } else {
          setUser(null);
          setProfile(null);
          setIsOffline(false);
        }
      }
      setLoading(false);
    });

    // Obtener sesión actual al arrancar
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        const local = await loadLocalSession();
        if (local.user) {
          setUser({ ...local.user, uid: local.user.uid });
          setProfile(local.profile);
          setIsOffline(true);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = async () => {
    try {
      const isOnline = await storageService.isOnline();
      if (isOnline) await cerrarSesion();
    } catch (error) {
      console.log('[AuthContext] Error cerrando sesión:', error);
    }
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
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};