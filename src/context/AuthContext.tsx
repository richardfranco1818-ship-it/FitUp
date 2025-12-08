import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  observarAuth,
  obtenerPerfil,
  UserProfile,
  cerrarSesion,
} from "../services/authService";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observarAuth(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userProfile = await obtenerPerfil(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await cerrarSesion();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile, logout }}>
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