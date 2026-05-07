// src/services/photoService.ts
import { supabase } from '../config/supabase';
import * as ImagePicker from 'expo-image-picker';

// ── PEDIR PERMISOS ────────────────────────────────────────────
export const pedirPermisosGaleria = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }
  return true;
};

// ── SELECCIONAR IMAGEN ────────────────────────────────────────
export const seleccionarImagen = async (): Promise<string | null> => {
  const tienePermiso = await pedirPermisosGaleria();
  if (!tienePermiso) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5, // comprimir para no gastar storage
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
};

// ── SUBIR FOTO A SUPABASE STORAGE ─────────────────────────────
export const subirFotoPerfil = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  console.log('[PhotoService] Iniciando subida de foto...');

  // En React Native no existe blob, se usa ArrayBuffer
  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();

  // Nombre único del archivo
  const fileName = `${userId}/avatar.jpg`;

  // Subir a Supabase Storage
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error('[PhotoService] Error subiendo foto:', error.message);
    throw new Error('No se pudo subir la foto de perfil');
  }

  // Obtener URL pública
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  console.log('[PhotoService] ✓ Foto subida exitosamente:', data.publicUrl);
  return data.publicUrl;
};

// ── ELIMINAR FOTO ANTERIOR ────────────────────────────────────
export const eliminarFotoPerfil = async (userId: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('avatars')
    .remove([`${userId}/avatar.jpg`]);

  if (error) {
    console.warn('[PhotoService] No se pudo eliminar foto anterior:', error.message);
  }
};