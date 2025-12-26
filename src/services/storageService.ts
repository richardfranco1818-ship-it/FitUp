/**
 * StorageService - Servicio de Almacenamiento Local Offline-First
 * FitUp - Exercise App
 * 
 * Este servicio implementa el patrón Offline-First usando AsyncStorage
 * para persistir datos localmente y sincronizarlos con Firebase cuando hay conexión.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CardioWorkout } from '../../types/cardio.types';
import { CyclingWorkout } from '../../types/cycling.types';
import { GymWorkout } from '../../types/gym.types';

// ==========================================
// CLAVES DE ALMACENAMIENTO
// ==========================================

export const STORAGE_KEYS = {
  // Datos de entrenamientos
  CARDIO_WORKOUTS: '@fitup_cardio_workouts',
  CYCLING_WORKOUTS: '@fitup_cycling_workouts',
  GYM_WORKOUTS: '@fitup_gym_workouts',
  
  // Estadísticas del usuario
  CARDIO_STATS: '@fitup_cardio_stats',
  CYCLING_STATS: '@fitup_cycling_stats',
  GYM_STATS: '@fitup_gym_stats',
  
  // Cola de sincronización
  SYNC_QUEUE: '@fitup_sync_queue',
  
  // Perfil del usuario (caché)
  USER_PROFILE: '@fitup_user_profile',
  
  // Última sincronización
  LAST_SYNC: '@fitup_last_sync',
};

// ==========================================
// TIPOS PARA LA COLA DE SINCRONIZACIÓN
// ==========================================

export type SyncAction = 'create' | 'update' | 'delete';
export type WorkoutCollection = 'cardioWorkouts' | 'cyclingWorkouts' | 'gymWorkouts';

export interface SyncQueueItem {
  id: string;                    // ID único de la operación
  collection: WorkoutCollection; // Colección destino en Firebase
  action: SyncAction;            // Tipo de operación
  data: any;                     // Datos del entrenamiento
  oderId: string;                // ID del usuario (oderId para compatibilidad)
  createdAt: number;             // Timestamp de creación
  retryCount: number;            // Contador de reintentos
}

// Tipo union para todos los entrenamientos
export type AnyWorkout = CardioWorkout | CyclingWorkout | GymWorkout;

// ==========================================
// CLASE PRINCIPAL DE ALMACENAMIENTO
// ==========================================

class StorageService {
  
  // ==========================================
  // MÉTODOS GENÉRICOS DE ALMACENAMIENTO
  // ==========================================

  /**
   * Guarda datos en AsyncStorage
   */
  async storeData<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`[StorageService] Guardado exitoso: ${key}`);
    } catch (error) {
      console.error(`[StorageService] Error guardando ${key}:`, error);
      throw new Error('No se pudo guardar en almacenamiento local');
    }
  }

  /**
   * Recupera datos de AsyncStorage
   */
  async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`[StorageService] Error leyendo ${key}:`, error);
      return null;
    }
  }

  /**
   * Elimina datos de AsyncStorage
   */
  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`[StorageService] Eliminado: ${key}`);
    } catch (error) {
      console.error(`[StorageService] Error eliminando ${key}:`, error);
    }
  }

  /**
   * Limpia todo el almacenamiento local
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('[StorageService] Almacenamiento limpiado');
    } catch (error) {
      console.error('[StorageService] Error limpiando almacenamiento:', error);
    }
  }

  // ==========================================
  // GESTIÓN DE ENTRENAMIENTOS LOCALES
  // ==========================================

  /**
   * Guarda un entrenamiento en almacenamiento local
   */
  async saveWorkoutLocally(
    type: 'cardio' | 'cycling' | 'gym',
    workout: AnyWorkout
  ): Promise<void> {
    const key = this.getWorkoutKey(type);
    const workouts = await this.getData<AnyWorkout[]>(key) || [];
    
    // Buscar si ya existe (para actualización)
    const existingIndex = workouts.findIndex(w => w.id === workout.id);
    
    if (existingIndex >= 0) {
      workouts[existingIndex] = workout;
    } else {
      workouts.push(workout);
    }
    
    await this.storeData(key, workouts);
    console.log(`[StorageService] Entrenamiento ${type} guardado localmente`);
  }

  /**
   * Obtiene todos los entrenamientos locales de un tipo
   */
  async getLocalWorkouts(
    type: 'cardio' | 'cycling' | 'gym',
    oderId?: string
  ): Promise<AnyWorkout[]> {
    const key = this.getWorkoutKey(type);
    const workouts = await this.getData<AnyWorkout[]>(key) || [];
    
    if (oderId) {
      return workouts.filter(w => {
        // Verificar el campo correcto según el tipo
        if ('userId' in w) return (w as CardioWorkout | CyclingWorkout).userId === oderId;
        if ('oderId' in w) return (w as GymWorkout).oderId === oderId;
        return false;
      });
    }
    
    return workouts;
  }

  /**
   * Elimina un entrenamiento del almacenamiento local
   */
  async deleteLocalWorkout(
    type: 'cardio' | 'cycling' | 'gym',
    workoutId: string
  ): Promise<void> {
    const key = this.getWorkoutKey(type);
    const workouts = await this.getData<AnyWorkout[]>(key) || [];
    
    const filtered = workouts.filter(w => w.id !== workoutId);
    await this.storeData(key, filtered);
    
    console.log(`[StorageService] Entrenamiento ${workoutId} eliminado localmente`);
  }

  /**
   * Helper para obtener la clave de almacenamiento según el tipo
   */
  private getWorkoutKey(type: 'cardio' | 'cycling' | 'gym'): string {
    switch (type) {
      case 'cardio': return STORAGE_KEYS.CARDIO_WORKOUTS;
      case 'cycling': return STORAGE_KEYS.CYCLING_WORKOUTS;
      case 'gym': return STORAGE_KEYS.GYM_WORKOUTS;
    }
  }

  // ==========================================
  // COLA DE SINCRONIZACIÓN
  // ==========================================

  /**
   * Agrega una operación a la cola de sincronización
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
    const queue = await this.getSyncQueue();
    
    const newItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      retryCount: 0,
    };
    
    queue.push(newItem);
    await this.storeData(STORAGE_KEYS.SYNC_QUEUE, queue);
    
    console.log(`[StorageService] Operación agregada a cola de sync:`, newItem.action, newItem.collection);
  }

  /**
   * Obtiene la cola de sincronización actual
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return await this.getData<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE) || [];
  }

  /**
   * Elimina un item de la cola de sincronización
   */
  async removeFromSyncQueue(itemId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter(item => item.id !== itemId);
    await this.storeData(STORAGE_KEYS.SYNC_QUEUE, filtered);
  }

  /**
   * Actualiza el contador de reintentos de un item
   */
  async incrementRetryCount(itemId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const item = queue.find(i => i.id === itemId);
    
    if (item) {
      item.retryCount += 1;
      await this.storeData(STORAGE_KEYS.SYNC_QUEUE, queue);
    }
  }

  /**
   * Limpia items que han fallado demasiadas veces
   */
  async cleanupFailedItems(maxRetries: number = 5): Promise<number> {
    const queue = await this.getSyncQueue();
    const validItems = queue.filter(item => item.retryCount < maxRetries);
    const removedCount = queue.length - validItems.length;
    
    if (removedCount > 0) {
      await this.storeData(STORAGE_KEYS.SYNC_QUEUE, validItems);
      console.log(`[StorageService] ${removedCount} items fallidos eliminados de la cola`);
    }
    
    return removedCount;
  }

  // ==========================================
  // VERIFICACIÓN DE CONECTIVIDAD
  // ==========================================

  /**
   * Verifica si hay conexión a internet
   */
  async isOnline(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected === true;
    } catch (error) {
      console.error('[StorageService] Error verificando conexión:', error);
      return false;
    }
  }

  /**
   * Obtiene el número de operaciones pendientes
   */
  async getPendingOperationsCount(): Promise<number> {
    const queue = await this.getSyncQueue();
    return queue.length;
  }

  // ==========================================
  // ÚLTIMA SINCRONIZACIÓN
  // ==========================================

  async setLastSyncTime(): Promise<void> {
    await this.storeData(STORAGE_KEYS.LAST_SYNC, Date.now());
  }

  async getLastSyncTime(): Promise<number | null> {
    return await this.getData<number>(STORAGE_KEYS.LAST_SYNC);
  }

  /**
   * Formatea la última sincronización para mostrar al usuario
   */
  async getLastSyncFormatted(): Promise<string> {
    const lastSync = await this.getLastSyncTime();
    
    if (!lastSync) {
      return 'Nunca sincronizado';
    }
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - lastSync;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} horas`;
    
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Exportar instancia única (Singleton)
export const storageService = new StorageService();
export default storageService;