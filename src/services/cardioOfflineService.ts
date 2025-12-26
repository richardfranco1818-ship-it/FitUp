/**
 * CardioOfflineService - Wrapper Offline-First para Cardio
 * FitUp - Exercise App
 * 
 * Este servicio envuelve cardioService para implementar el patrón offline-first:
 * 1. Guarda primero en almacenamiento local (AsyncStorage)
 * 2. Agrega la operación a la cola de sincronización
 * 3. Si hay conexión, sincroniza automáticamente con Firebase
 */

import { storageService } from './storageService';
import { syncService } from './syncService';
import { 
  saveWorkout as saveToFirebase,
  getUserWorkouts as getFromFirebase,
  deleteWorkout as deleteFromFirebase,
  getUserStats,
} from './cardioService';
import { CardioWorkout, CardioStats, WorkoutFilters } from '../../types/cardio.types';

// ==========================================
// GUARDAR ENTRENAMIENTO (OFFLINE-FIRST)
// ==========================================

/**
 * Guarda un entrenamiento con patrón offline-first
 * 
 * Flujo:
 * 1. Genera un ID temporal
 * 2. Guarda en AsyncStorage
 * 3. Agrega a cola de sincronización
 * 4. Si hay internet, sincroniza inmediatamente
 */
export const saveCardioWorkout = async (
  workout: Omit<CardioWorkout, 'id'>
): Promise<string> => {
  console.log('[CardioOffline] Guardando entrenamiento offline-first...');
  
  // Generar ID temporal
  const tempId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const workoutWithId: CardioWorkout = {
    ...workout,
    id: tempId,
  };

  try {
    // 1. Guardar localmente primero (SIEMPRE funciona)
    await storageService.saveWorkoutLocally('cardio', workoutWithId);
    console.log('[CardioOffline] ✓ Guardado localmente con ID:', tempId);

    // 2. Agregar a cola de sincronización
    await storageService.addToSyncQueue({
      collection: 'cardioWorkouts',
      action: 'create',
      data: workout, // Sin el ID temporal, Firebase generará el real
      oderId: workout.userId,
    });
    console.log('[CardioOffline] ✓ Agregado a cola de sincronización');

    // 3. Intentar sincronizar si hay conexión
    const isOnline = await storageService.isOnline();
    if (isOnline) {
      console.log('[CardioOffline] Online - iniciando sincronización...');
      // No await aquí para no bloquear la UI
      syncService.processQueue().catch(err => {
        console.warn('[CardioOffline] Error en sincronización automática:', err);
      });
    } else {
      console.log('[CardioOffline] Offline - se sincronizará cuando haya conexión');
    }

    return tempId;
    
  } catch (error) {
    console.error('[CardioOffline] Error guardando entrenamiento:', error);
    throw new Error('No se pudo guardar el entrenamiento');
  }
};

// ==========================================
// OBTENER ENTRENAMIENTOS (CON FALLBACK LOCAL)
// ==========================================

/**
 * Obtiene entrenamientos con fallback a datos locales
 */
export const getCardioWorkouts = async (
  userId: string,
  filters?: WorkoutFilters,
  maxResults: number = 50
): Promise<CardioWorkout[]> => {
  console.log('[CardioOffline] Obteniendo entrenamientos...');
  
  let firebaseWorkouts: CardioWorkout[] = [];
  let localWorkouts: CardioWorkout[] = [];
  
  // Intentar obtener de Firebase
  const isOnline = await storageService.isOnline();
  
  if (isOnline) {
    try {
      firebaseWorkouts = await getFromFirebase(userId, filters, maxResults);
      console.log(`[CardioOffline] ${firebaseWorkouts.length} entrenamientos de Firebase`);
      
      // Actualizar caché local con datos de Firebase
      for (const workout of firebaseWorkouts) {
        await storageService.saveWorkoutLocally('cardio', workout);
      }
    } catch (error) {
      console.warn('[CardioOffline] Error obteniendo de Firebase:', error);
    }
  }
  
  // Siempre obtener datos locales
  localWorkouts = await storageService.getLocalWorkouts('cardio', userId) as CardioWorkout[];
  console.log(`[CardioOffline] ${localWorkouts.length} entrenamientos locales`);
  
  // Combinar sin duplicados (preferir Firebase si existe)
  const combined = combineWorkouts(firebaseWorkouts, localWorkouts);
  
  // Aplicar filtros si es necesario
  let filtered = combined;
  if (filters) {
    filtered = applyFilters(combined, filters);
  }
  
  // Ordenar por fecha (más recientes primero)
  filtered.sort((a, b) => b.startTime - a.startTime);
  
  // Limitar resultados
  return filtered.slice(0, maxResults);
};

// ==========================================
// ELIMINAR ENTRENAMIENTO (OFFLINE-FIRST)
// ==========================================

/**
 * Elimina un entrenamiento con patrón offline-first
 */
export const deleteCardioWorkout = async (
  workoutId: string,
  userId: string
): Promise<void> => {
  console.log('[CardioOffline] Eliminando entrenamiento:', workoutId);
  
  try {
    // 1. Eliminar localmente primero
    await storageService.deleteLocalWorkout('cardio', workoutId);
    console.log('[CardioOffline] ✓ Eliminado localmente');

    // 2. Si no es un ID local, agregar a cola de sincronización
    if (!workoutId.startsWith('local_')) {
      await storageService.addToSyncQueue({
        collection: 'cardioWorkouts',
        action: 'delete',
        data: { id: workoutId },
        oderId: userId,
      });
      console.log('[CardioOffline] ✓ Agregado a cola de eliminación');

      // 3. Intentar sincronizar si hay conexión
      const isOnline = await storageService.isOnline();
      if (isOnline) {
        syncService.processQueue().catch(console.warn);
      }
    }
  } catch (error) {
    console.error('[CardioOffline] Error eliminando entrenamiento:', error);
    throw new Error('No se pudo eliminar el entrenamiento');
  }
};

// ==========================================
// ESTADÍSTICAS (CON CACHÉ)
// ==========================================

/**
 * Obtiene estadísticas del usuario
 */
export const getCardioStats = async (userId: string): Promise<CardioStats | null> => {
  const isOnline = await storageService.isOnline();
  
  if (isOnline) {
    try {
      const stats = await getUserStats(userId);
      if (stats) {
        // Cachear estadísticas
        await storageService.storeData(`@fitup_cardio_stats_${userId}`, stats);
        return stats;
      }
    } catch (error) {
      console.warn('[CardioOffline] Error obteniendo stats de Firebase:', error);
    }
  }
  
  // Fallback: obtener del caché
  const cachedStats = await storageService.getData<CardioStats>(`@fitup_cardio_stats_${userId}`);
  
  if (cachedStats) {
    return cachedStats;
  }
  
  // Fallback final: calcular desde datos locales
  return calculateLocalStats(userId);
};

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Combina entrenamientos de Firebase y locales sin duplicados
 */
function combineWorkouts(
  firebase: CardioWorkout[],
  local: CardioWorkout[]
): CardioWorkout[] {
  const combined = new Map<string, CardioWorkout>();
  
  // Agregar entrenamientos de Firebase (tienen prioridad)
  for (const workout of firebase) {
    if (workout.id) {
      combined.set(workout.id, workout);
    }
  }
  
  // Agregar entrenamientos locales que no están en Firebase
  for (const workout of local) {
    if (workout.id) {
      if (workout.id.startsWith('local_') || !combined.has(workout.id)) {
        combined.set(workout.id, workout);
      }
    }
  }
  
  return Array.from(combined.values());
}

/**
 * Aplica filtros a la lista de entrenamientos
 */
function applyFilters(
  workouts: CardioWorkout[],
  filters: WorkoutFilters
): CardioWorkout[] {
  let filtered = workouts;
  
  if (filters.type) {
    filtered = filtered.filter(w => w.type === filters.type);
  }
  if (filters.dateFrom) {
    filtered = filtered.filter(w => w.startTime >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter(w => w.startTime <= filters.dateTo!);
  }
  if (filters.minDistance) {
    filtered = filtered.filter(w => w.totalDistance >= filters.minDistance!);
  }
  if (filters.maxDistance) {
    filtered = filtered.filter(w => w.totalDistance <= filters.maxDistance!);
  }
  
  return filtered;
}

/**
 * Calcula estadísticas desde datos locales
 */
async function calculateLocalStats(userId: string): Promise<CardioStats | null> {
  const workouts = await storageService.getLocalWorkouts('cardio', userId) as CardioWorkout[];
  
  if (workouts.length === 0) {
    return null;
  }
  
  const stats: CardioStats = {
    totalWorkouts: workouts.length,
    totalDistance: workouts.reduce((sum, w) => sum + (w.totalDistance || 0), 0),
    totalTime: workouts.reduce((sum, w) => sum + (w.totalDuration || 0), 0),
    totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
    avgDistance: 0,
    avgDuration: 0,
    avgPace: 0,
    longestDistance: Math.max(...workouts.map(w => w.totalDistance || 0)),
    longestDuration: Math.max(...workouts.map(w => w.totalDuration || 0)),
    fastestPace: Math.min(...workouts.filter(w => w.averagePace && w.averagePace > 0).map(w => w.averagePace!)),
    workoutsByType: {},
    currentStreak: 0,
    longestStreak: 0,
  };
  
  stats.avgDistance = stats.totalDistance / stats.totalWorkouts;
  stats.avgDuration = stats.totalTime / stats.totalWorkouts;
  
  if (stats.totalDistance > 0) {
    stats.avgPace = stats.totalTime / (stats.totalDistance / 1000);
  }
  
  // Contar por tipo
  for (const workout of workouts) {
    const type = workout.type;
    stats.workoutsByType[type] = (stats.workoutsByType[type] || 0) + 1;
  }
  
  return stats;
}

// ==========================================
// EXPORTS
// ==========================================

export default {
  saveCardioWorkout,
  getCardioWorkouts,
  deleteCardioWorkout,
  getCardioStats,
};