/**
 * Servicio de Firebase para entrenamientos de Ciclismo
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
  limit,
  Timestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import { 
  CyclingWorkout, 
  CyclingStats, 
  CyclingFilters,
} from '../../types/cycling.types';

// Constantes
const COLLECTION_WORKOUTS = 'cyclingWorkouts';
const COLLECTION_STATS = 'userStats';

// Conversión a Firestore
const toFirestoreWorkout = (workout: Omit<CyclingWorkout, 'id'>): Record<string, any> => {
  const data: Record<string, any> = {
    userId: workout.userId,
    type: workout.type,
    status: workout.status,
    startTime: Timestamp.fromMillis(workout.startTime),
    totalDuration: workout.totalDuration || 0,
    totalDistance: workout.totalDistance || 0,
    averageSpeed: workout.averageSpeed || 0,
    caloriesBurned: workout.caloriesBurned || 0,
    route: workout.route || [],
    createdAt: Timestamp.fromMillis(workout.createdAt || Date.now()),
  };

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

  return data;
};

// Conversión desde Firestore
const fromFirestoreWorkout = (id: string, data: Record<string, any>): CyclingWorkout => {
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
    maxSpeed: data.maxSpeed,
    caloriesBurned: data.caloriesBurned,
    elevationGain: data.elevationGain,
    elevationLoss: data.elevationLoss,
    route: data.route || [],
    notes: data.notes,
    rating: data.rating,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt?.toMillis(),
  };
};

// Guardar entrenamiento
export const saveCyclingWorkout = async (
  workout: Omit<CyclingWorkout, 'id'>
): Promise<string> => {
  try {
    console.log('=== GUARDANDO RUTA CICLISMO ===');
    
    const workoutsRef = collection(db, COLLECTION_WORKOUTS);
    const firestoreData = toFirestoreWorkout(workout);
    
    const docRef = await addDoc(workoutsRef, firestoreData);
    
    console.log('Ruta guardada con ID:', docRef.id);
    
    await updateCyclingStats(workout.userId, workout);
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error guardando ruta:', error);
    throw new Error('No se pudo guardar la ruta');
  }
};

// Obtener entrenamientos del usuario
export const getUserCyclingWorkouts = async (
  userId: string,
  filters?: CyclingFilters,
  maxResults: number = 50
): Promise<CyclingWorkout[]> => {
  try {
    const workoutsRef = collection(db, COLLECTION_WORKOUTS);
    
    const q = query(
      workoutsRef,
      where('userId', '==', userId),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    
    const workouts: CyclingWorkout[] = [];
    querySnapshot.forEach((docSnap) => {
      workouts.push(fromFirestoreWorkout(docSnap.id, docSnap.data()));
    });
    
    // Ordenar por fecha (más recientes primero)
    workouts.sort((a, b) => b.startTime - a.startTime);
    
    // Aplicar filtros
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
    
    return filtered;
  } catch (error) {
    console.error('Error obteniendo rutas:', error);
    throw new Error('No se pudieron obtener las rutas');
  }
};

// Eliminar entrenamiento
export const deleteCyclingWorkout = async (workoutId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_WORKOUTS, workoutId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error eliminando ruta:', error);
    throw new Error('No se pudo eliminar la ruta');
  }
};

// Obtener estadísticas
export const getCyclingStats = async (userId: string): Promise<CyclingStats | null> => {
  try {
    const docRef = doc(db, COLLECTION_STATS, `cycling_${userId}`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docSnap.data() as CyclingStats;
  } catch (error) {
    console.error('Error obteniendo stats:', error);
    return null;
  }
};

// Actualizar estadísticas
export const updateCyclingStats = async (
  userId: string,
  newWorkout: Omit<CyclingWorkout, 'id'>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_STATS, `cycling_${userId}`);
    const docSnap = await getDoc(docRef);
    
    let currentStats: CyclingStats;
    
    if (docSnap.exists()) {
      currentStats = docSnap.data() as CyclingStats;
    } else {
      currentStats = {
        totalWorkouts: 0,
        totalDistance: 0,
        totalTime: 0,
        totalCalories: 0,
        avgDistance: 0,
        avgDuration: 0,
        avgSpeed: 0,
        longestDistance: 0,
        longestDuration: 0,
        fastestSpeed: 0,
        workoutsByType: {},
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
    if (currentStats.totalTime > 0) {
      currentStats.avgSpeed = (currentStats.totalDistance / 1000) / (currentStats.totalTime / 3600);
    }
    
    // Actualizar records
    if (newWorkout.totalDistance > currentStats.longestDistance) {
      currentStats.longestDistance = newWorkout.totalDistance;
    }
    if (newWorkout.totalDuration > currentStats.longestDuration) {
      currentStats.longestDuration = newWorkout.totalDuration;
    }
    if (newWorkout.averageSpeed > currentStats.fastestSpeed) {
      currentStats.fastestSpeed = newWorkout.averageSpeed;
    }
    
    // Actualizar por tipo
    const typeCount = currentStats.workoutsByType[newWorkout.type] || 0;
    currentStats.workoutsByType[newWorkout.type] = typeCount + 1;
    
    currentStats.lastWorkoutDate = newWorkout.startTime;
    
    await setDoc(docRef, currentStats);
  } catch (error) {
    console.error('Error actualizando stats:', error);
  }
};