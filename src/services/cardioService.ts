/**
 * Servicio de Firebase para entrenamientos de Cardio
 * FITUP - Exercise App
 */

import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import { 
  CardioWorkout, 
  CardioStats, 
  WorkoutFilters,
} from '../../types/cardio.types';

// ==========================================
// CONSTANTES
// ==========================================

const COLLECTION_WORKOUTS = 'cardioWorkouts';
const COLLECTION_STATS = 'userStats';

// ==========================================
// FUNCIONES DE CONVERSIÓN
// ==========================================

/**
 * Convierte un workout local a formato Firestore
 * Elimina campos undefined que Firestore no acepta
 */
const toFirestoreWorkout = (workout: Omit<CardioWorkout, 'id'>): Record<string, any> => {
  const data: Record<string, any> = {
    userId: workout.userId,
    type: workout.type,
    status: workout.status,
    startTime: Timestamp.fromMillis(workout.startTime),
    totalDuration: workout.totalDuration || 0,
    totalDistance: workout.totalDistance || 0,
    averageSpeed: workout.averageSpeed || 0,
    averagePace: workout.averagePace || 0,
    caloriesBurned: workout.caloriesBurned || 0,
    route: workout.route || [],
    splits: workout.splits || [],
    createdAt: Timestamp.fromMillis(workout.createdAt || Date.now()),
  };

  // Solo agregar campos opcionales si tienen valor
  if (workout.endTime) {
    data.endTime = Timestamp.fromMillis(workout.endTime);
  }
  if (workout.maxSpeed !== undefined && workout.maxSpeed !== null) {
    data.maxSpeed = workout.maxSpeed;
  }
  if (workout.elevationGain !== undefined && workout.elevationGain !== null) {
    data.elevationGain = workout.elevationGain;
  }
  if (workout.elevationLoss !== undefined && workout.elevationLoss !== null) {
    data.elevationLoss = workout.elevationLoss;
  }
  if (workout.notes) {
    data.notes = workout.notes;
  }
  if (workout.rating !== undefined && workout.rating !== null) {
    data.rating = workout.rating;
  }
  if (workout.config) {
    data.config = workout.config;
  }

  return data;
};

/**
 * Convierte un workout de Firestore a formato local
 */
const fromFirestoreWorkout = (id: string, data: Record<string, any>): CardioWorkout => {
  return {
    id,
    userId: data.userId,
    type: data.type,
    status: data.status,
    startTime: data.startTime.toMillis(),
    endTime: data.endTime?.toMillis(),
    totalDuration: data.totalDuration,
    totalDistance: data.totalDistance,
    averageSpeed: data.averageSpeed,
    averagePace: data.averagePace,
    maxSpeed: data.maxSpeed,
    caloriesBurned: data.caloriesBurned,
    elevationGain: data.elevationGain,
    elevationLoss: data.elevationLoss,
    route: data.route || [],
    splits: data.splits || [],
    config: data.config,
    notes: data.notes,
    rating: data.rating,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt?.toMillis(),
  };
};

// ==========================================
// CRUD DE ENTRENAMIENTOS
// ==========================================

/**
 * Guarda un nuevo entrenamiento de cardio
 */
export const saveWorkout = async (
  workout: Omit<CardioWorkout, 'id'>
): Promise<string> => {
  try {
    console.log('=== GUARDANDO WORKOUT ===');
    console.log('userId:', workout.userId);
    console.log('type:', workout.type);
    console.log('totalDistance:', workout.totalDistance);
    console.log('totalDuration:', workout.totalDuration);
    
    const workoutsRef = collection(db, COLLECTION_WORKOUTS);
    const firestoreData = toFirestoreWorkout(workout);
    
    console.log('Datos preparados para Firestore');
    
    const docRef = await addDoc(workoutsRef, firestoreData);
    
    console.log('Workout guardado con ID:', docRef.id);
    
    // Actualizar estadísticas del usuario
    await updateUserStats(workout.userId, workout);
    
    return docRef.id;
  } catch (error: any) {
    console.error('=== ERROR DETALLADO ===');
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('Error completo:', error);
    throw new Error('No se pudo guardar el entrenamiento');
  }
};

/**
 * Obtiene un entrenamiento por ID
 */
export const getWorkout = async (
  workoutId: string
): Promise<CardioWorkout | null> => {
  try {
    const docRef = doc(db, COLLECTION_WORKOUTS, workoutId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return fromFirestoreWorkout(docSnap.id, docSnap.data());
  } catch (error) {
    console.error('Error obteniendo workout:', error);
    throw new Error('No se pudo obtener el entrenamiento');
  }
};

/**
 * Obtiene todos los entrenamientos de un usuario
 */
export const getUserWorkouts = async (
  userId: string,
  filters?: WorkoutFilters,
  maxResults: number = 50
): Promise<CardioWorkout[]> => {
  try {
    const workoutsRef = collection(db, COLLECTION_WORKOUTS);
    
    const q = query(
      workoutsRef,
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    
    const workouts: CardioWorkout[] = [];
    querySnapshot.forEach((docSnap) => {
      workouts.push(fromFirestoreWorkout(docSnap.id, docSnap.data()));
    });
    
    // Filtros adicionales en cliente
    let filtered = workouts;
    
    if (filters?.type) {
      filtered = filtered.filter(w => w.type === filters.type);
    }
    if (filters?.dateFrom) {
      filtered = filtered.filter(w => w.startTime >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      filtered = filtered.filter(w => w.startTime <= filters.dateTo!);
    }
    if (filters?.minDistance) {
      filtered = filtered.filter(w => w.totalDistance >= filters.minDistance!);
    }
    if (filters?.maxDistance) {
      filtered = filtered.filter(w => w.totalDistance <= filters.maxDistance!);
    }
    
    return filtered;
  } catch (error) {
    console.error('Error obteniendo workouts:', error);
    throw new Error('No se pudieron obtener los entrenamientos');
  }
};

/**
 * Elimina un entrenamiento
 */
export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_WORKOUTS, workoutId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error eliminando workout:', error);
    throw new Error('No se pudo eliminar el entrenamiento');
  }
};

// ==========================================
// ESTADÍSTICAS DEL USUARIO
// ==========================================

/**
 * Obtiene las estadísticas de cardio de un usuario
 */
export const getUserStats = async (userId: string): Promise<CardioStats | null> => {
  try {
    const docRef = doc(db, COLLECTION_STATS, `cardio_${userId}`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docSnap.data() as CardioStats;
  } catch (error) {
    console.error('Error obteniendo stats:', error);
    return null;
  }
};

/**
 * Actualiza las estadísticas del usuario después de un entrenamiento
 */
export const updateUserStats = async (
  userId: string,
  newWorkout: Omit<CardioWorkout, 'id'>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_STATS, `cardio_${userId}`);
    const docSnap = await getDoc(docRef);
    
    let currentStats: CardioStats;
    
    if (docSnap.exists()) {
      currentStats = docSnap.data() as CardioStats;
    } else {
      // Inicializar estadísticas nuevas
      currentStats = {
        totalWorkouts: 0,
        totalDistance: 0,
        totalTime: 0,
        totalCalories: 0,
        avgDistance: 0,
        avgDuration: 0,
        avgPace: 0,
        longestDistance: 0,
        longestDuration: 0,
        fastestPace: 9999, // Usar número alto en lugar de Infinity
        workoutsByType: {},
        currentStreak: 0,
        longestStreak: 0,
      };
    }
    
    // Actualizar totales
    currentStats.totalWorkouts += 1;
    currentStats.totalDistance += newWorkout.totalDistance;
    currentStats.totalTime += newWorkout.totalDuration;
    currentStats.totalCalories += newWorkout.caloriesBurned || 0;
    
    // Actualizar promedios
    currentStats.avgDistance = currentStats.totalDistance / currentStats.totalWorkouts;
    currentStats.avgDuration = currentStats.totalTime / currentStats.totalWorkouts;
    if (currentStats.totalDistance > 0) {
      currentStats.avgPace = currentStats.totalTime / (currentStats.totalDistance / 1000);
    }
    
    // Actualizar records
    if (newWorkout.totalDistance > currentStats.longestDistance) {
      currentStats.longestDistance = newWorkout.totalDistance;
    }
    if (newWorkout.totalDuration > currentStats.longestDuration) {
      currentStats.longestDuration = newWorkout.totalDuration;
    }
    if (newWorkout.averagePace < currentStats.fastestPace && newWorkout.averagePace > 0) {
      currentStats.fastestPace = newWorkout.averagePace;
    }
    
    // Actualizar por tipo
    const typeCount = currentStats.workoutsByType[newWorkout.type] || 0;
    currentStats.workoutsByType[newWorkout.type] = typeCount + 1;
    
    currentStats.lastWorkoutDate = newWorkout.startTime;
    
    // Guardar estadísticas
    await setDoc(docRef, currentStats);
  } catch (error) {
    console.error('Error actualizando stats:', error);
  }
};

/**
 * Obtiene los entrenamientos de la última semana
 */
export const getWeeklyWorkouts = async (userId: string): Promise<CardioWorkout[]> => {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return getUserWorkouts(userId, { dateFrom: weekAgo });
};

/**
 * Obtiene el último entrenamiento del usuario
 */
export const getLastWorkout = async (userId: string): Promise<CardioWorkout | null> => {
  const workouts = await getUserWorkouts(userId, undefined, 1);
  return workouts.length > 0 ? workouts[0] : null;
};