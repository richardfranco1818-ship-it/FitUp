// src/services/authService.ts
import { supabase } from '../config/supabase';

export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  peso: string;
  altura: string;
  edad: string;
  actividadFavorita: string;
  fotoPerfil?: string;
  createdAt?: Date;
}

// ── REGISTRAR USUARIO ────────────────────────────────────────
export const registrarUsuario = async (
  email: string,
  password: string,
  nombre: string,
  peso: string,
  altura: string,
  edad: string,
  actividadFavorita: string
): Promise<UserProfile> => {
  console.log('[Auth] Iniciando registro para:', email);

  const { data, error } = await supabase.auth.signUp({ email, password });

  console.log('[Auth] Respuesta signUp:', { data, error });

  if (error) throw new Error(getErrorMessage(error.message));
  if (!data.user) throw new Error('No se pudo crear el usuario');

  console.log('[Auth] Usuario creado con ID:', data.user.id);

  // Upsert: inserta si no existe, actualiza si ya existe
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      email,
      nombre,
      peso,
      altura,
      edad,
      actividad_favorita: actividadFavorita,
      foto_perfil: '',
    });

  console.log('[Auth] Respuesta upsert perfil:', { profileError });

  if (profileError) throw new Error(profileError.message);

  console.log('[Auth] Registro completado exitosamente');

  return {
    uid: data.user.id,
    email,
    nombre,
    peso,
    altura,
    edad,
    actividadFavorita,
    fotoPerfil: '',
    createdAt: new Date(),
  };
};

// ── INICIAR SESIÓN ───────────────────────────────────────────
export const iniciarSesion = async (email: string, password: string) => {
  console.log('[Auth] Iniciando sesión para:', email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  console.log('[Auth] Respuesta signIn:', { data, error });
  if (error) throw new Error(getErrorMessage(error.message));
  return data.user;
};

// ── CERRAR SESIÓN ────────────────────────────────────────────
export const cerrarSesion = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

// ── OBTENER PERFIL ───────────────────────────────────────────
export const obtenerPerfil = async (uid: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error || !data) return null;

  return {
    uid: data.id,
    email: data.email ?? '',
    nombre: data.nombre ?? '',
    peso: data.peso ?? '',
    altura: data.altura ?? '',
    edad: data.edad ?? '',
    actividadFavorita: data.actividad_favorita ?? '',
    fotoPerfil: data.foto_perfil ?? '',
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
  };
};

// ── ACTUALIZAR PERFIL ────────────────────────────────────────
export const actualizarPerfil = async (
  uid: string,
  datos: Partial<UserProfile>
): Promise<void> => {
  const dbData: Record<string, any> = {};
  if (datos.nombre !== undefined)            dbData.nombre = datos.nombre;
  if (datos.email !== undefined)             dbData.email = datos.email;
  if (datos.peso !== undefined)              dbData.peso = datos.peso;
  if (datos.altura !== undefined)            dbData.altura = datos.altura;
  if (datos.edad !== undefined)              dbData.edad = datos.edad;
  if (datos.actividadFavorita !== undefined) dbData.actividad_favorita = datos.actividadFavorita;
  if (datos.fotoPerfil !== undefined)        dbData.foto_perfil = datos.fotoPerfil;

  const { error } = await supabase
    .from('profiles')
    .update(dbData)
    .eq('id', uid);

  if (error) throw new Error(error.message);
};

// ── RECUPERAR CONTRASEÑA ─────────────────────────────────────
export const recuperarContrasena = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(getErrorMessage(error.message));
};

// ── OBSERVAR AUTH STATE ──────────────────────────────────────
export const observarAuth = (callback: (user: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
};

// ── MENSAJES DE ERROR ────────────────────────────────────────
const getErrorMessage = (message: string): string => {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos';
  if (message.includes('Email not confirmed'))        return 'Confirma tu correo antes de iniciar sesión';
  if (message.includes('User already registered'))    return 'Este correo ya está registrado';
  if (message.includes('Password should be'))         return 'La contraseña debe tener al menos 6 caracteres';
  if (message.includes('Unable to validate'))         return 'Correo electrónico inválido';
  return message;
};