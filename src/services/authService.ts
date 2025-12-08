import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// Interfaz para los datos del perfil
export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  peso: string;
  altura: string;
  edad: string;
  actividadFavorita: string;
  fotoPerfil?: string;
  createdAt: Date;
}

// Registrar nuevo usuario
export const registrarUsuario = async (
  email: string,
  password: string,
  nombre: string,
  peso: string,
  altura: string,
  edad: string,
  actividadFavorita: string
): Promise<UserProfile> => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Crear perfil en Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: email,
      nombre: nombre,
      peso: peso,
      altura: altura,
      edad: edad,
      actividadFavorita: actividadFavorita,
      fotoPerfil: "",
      createdAt: new Date(),
    };

    await setDoc(doc(db, "usuarios", user.uid), userProfile);

    return userProfile;
  } catch (error: any) {
    throw getErrorMessage(error.code);
  }
};

// Iniciar sesión
export const iniciarSesion = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw getErrorMessage(error.code);
  }
};

// Cerrar sesión
export const cerrarSesion = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw getErrorMessage(error.code);
  }
};

// Obtener perfil del usuario
export const obtenerPerfil = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }
};

// Actualizar perfil del usuario
export const actualizarPerfil = async (
  uid: string,
  datos: Partial<UserProfile>
): Promise<void> => {
  try {
    const docRef = doc(db, "usuarios", uid);
    await setDoc(docRef, datos, { merge: true });
  } catch (error: any) {
    throw new Error("Error al actualizar perfil");
  }
};

// Observar cambios en autenticación
export const observarAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Obtener usuario actual
export const obtenerUsuarioActual = (): User | null => {
  return auth.currentUser;
};

// Traducir errores de Firebase a español
const getErrorMessage = (errorCode: string): Error => {
  const errors: { [key: string]: string } = {
    "auth/email-already-in-use": "Este correo ya está registrado",
    "auth/invalid-email": "Correo electrónico inválido",
    "auth/operation-not-allowed": "Operación no permitida",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
    "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
    "auth/user-not-found": "No existe una cuenta con este correo",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/invalid-credential": "Credenciales inválidas",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
  };

  return new Error(errors[errorCode] || "Error desconocido. Intenta de nuevo");
};