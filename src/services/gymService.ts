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
  GymWorkout, 
  GymStats, 
  GymFilters,
} from '../../types/gym.types';

// Constantes
const COLLECTION_WORKOUTS = 'gymWorkouts';
const COLLECTION_STATS = 'userStats';

// Conversión a Firestore
const toFirestoreWorkout = (workout: Omit<GymWorkout, 'id'>): Record<string, any> => {
  const data: Record<string, any> = {
    oderId: workout.oderId,
    status: workout.status,
    startTime: Timestamp.fromMillis(workout.startTime),
    totalDuration: workout.totalDuration || 0,
    exercises: workout.exercises || [],
    totalVolume: workout.totalVolume || 0,
    totalSets: workout.totalSets || 0,
    totalReps: workout.totalReps || 0,
    createdAt: Timestamp.fromMillis(workout.createdAt || Date.now()),
  };

  if (workout.endTime) {
    data.endTime = Timestamp.fromMillis(workout.endTime);
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
const fromFirestoreWorkout = (id: string, data: Record<string, any>): GymWorkout => {
  return {
    id,
    oderId: data.oderId,
    status: data.status,
    startTime: data.startTime.toMillis(),
    endTime: data.endTime?.toMillis(),
    totalDuration: data.totalDuration,
    exercises: data.exercises || [],
    totalVolume: data.totalVolume,
    totalSets: data.totalSets,
    totalReps: data.totalReps,
    notes: data.notes,
    rating: data.rating,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt?.toMillis(),
  };
};

// Guardar entrenamiento
export const saveGymWorkout = async (
  workout: Omit<GymWorkout, 'id'>
): Promise<string> => {
  try {
    console.log('=== GUARDANDO ENTRENAMIENTO GYM ===');
    
    const workoutsRef = collection(db, COLLECTION_WORKOUTS);
    const firestoreData = toFirestoreWorkout(workout);
    
    const docRef = await addDoc(workoutsRef, firestoreData);
    
    console.log('Entrenamiento guardado con ID:', docRef.id);
    
    await updateGymStats(workout.oderId, workout);
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error guardando entrenamiento:', error);
    throw new Error('No se pudo guardar el entrenamiento');
  }
};

// Obtener entrenamientos del usuario
export const getUserGymWorkouts = async (
  oderId: string,
  filters?: GymFilters,
  maxResults: number = 50
): Promise<GymWorkout[]> => {
  try {
    const workoutsRef = collection(db, COLLECTION_WORKOUTS);
    
    const q = query(
      workoutsRef,
      where('oderId', '==', oderId),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    
    const workouts: GymWorkout[] = [];
    querySnapshot.forEach((docSnap) => {
      workouts.push(fromFirestoreWorkout(docSnap.id, docSnap.data()));
    });
    
    // Ordenar por fecha (más recientes primero)
    workouts.sort((a, b) => b.startTime - a.startTime);
    
    // Aplicar filtros
    let filtered = workouts;
    
    if (filters?.dateFrom) {
      filtered = filtered.filter(w => w.startTime >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      filtered = filtered.filter(w => w.startTime <= filters.dateTo!);
    }
    
    return filtered;
  } catch (error) {
    console.error('Error obteniendo entrenamientos:', error);
    throw new Error('No se pudieron obtener los entrenamientos');
  }
};

// Eliminar entrenamiento
export const deleteGymWorkout = async (workoutId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_WORKOUTS, workoutId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error eliminando entrenamiento:', error);
    throw new Error('No se pudo eliminar el entrenamiento');
  }
};

// Obtener estadísticas
export const getGymStats = async (oderId: string): Promise<GymStats | null> => {
  try {
    const docRef = doc(db, COLLECTION_STATS, `gym_${oderId}`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docSnap.data() as GymStats;
  } catch (error) {
    console.error('Error obteniendo stats:', error);
    return null;
  }
};

// Actualizar estadísticas
export const updateGymStats = async (
  oderId: string,
  newWorkout: Omit<GymWorkout, 'id'>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_STATS, `gym_${oderId}`);
    const docSnap = await getDoc(docRef);
    
    let currentStats: GymStats;
    
    if (docSnap.exists()) {
      currentStats = docSnap.data() as GymStats;
    } else {
      currentStats = {
        totalWorkouts: 0,
        totalVolume: 0,
        totalTime: 0,
        totalSets: 0,
        totalReps: 0,
        avgDuration: 0,
        avgVolume: 0,
        favoriteExercises: {},
      };
    }
    
    // Actualizar totales
    currentStats.totalWorkouts += 1;
    currentStats.totalVolume += newWorkout.totalVolume;
    currentStats.totalTime += newWorkout.totalDuration;
    currentStats.totalSets += newWorkout.totalSets;
    currentStats.totalReps += newWorkout.totalReps;
    
    // Actualizar promedios
    currentStats.avgDuration = currentStats.totalTime / currentStats.totalWorkouts;
    currentStats.avgVolume = currentStats.totalVolume / currentStats.totalWorkouts;
    
    // Actualizar ejercicios favoritos
    newWorkout.exercises.forEach(ex => {
      const count = currentStats.favoriteExercises[ex.exercise.id] || 0;
      currentStats.favoriteExercises[ex.exercise.id] = count + 1;
    });
    
    currentStats.lastWorkoutDate = newWorkout.startTime;
    
    await setDoc(docRef, currentStats);
  } catch (error) {
    console.error('Error actualizando stats:', error);
  }
};