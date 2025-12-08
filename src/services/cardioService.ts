/**
 * Servicio de Firebase para entrenamientos de Cardio
 * FITUP - Exercise App
 * 
 * NOTA: Debes tener configurado Firebase en tu proyecto.
 * Este archivo asume que ya tienes:
 * - firebase/firebaseConfig.ts con la configuración
 * - Las colecciones necesarias en Firestore
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentReference,
} from 'firebase/firestore';
// Importa tu instancia de Firestore
// import { db } from '../firebase/firebaseConfig';

import { 
  CardioWorkout, 
  CardioStats, 
  WorkoutFilters,
  CardioWorkoutType 
} from '../../types/cardio.types';

// ==========================================
// CONSTANTES
// ==========================================

const COLLECTION_WORKOUTS = 'cardioWorkouts';
const COLLECTION_STATS = 'userStats';

// ==========================================
// TIPOS PARA FIRESTORE
// ==========================================

interface FirestoreWorkout extends Omit<CardioWorkout, 'id' | 'startTime' | 'endTime' | 'createdAt' | 'updatedAt'> {
  startTime: Timestamp;
  endTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ==========================================
// FUNCIONES DE CONVERSIÓN
// ==========================================

/**
 * Convierte un workout local a formato Firestore
 */
const toFirestoreWorkout = (workout: Omit<CardioWorkout, 'id'>): FirestoreWorkout => {
  return {
    ...workout,
    startTime: Timestamp.fromMillis(workout.startTime),
    endTime: workout.endTime ? Timestamp.fromMillis(workout.endTime) : undefined,
    createdAt: Timestamp.fromMillis(workout.createdAt),
    updatedAt: workout.updatedAt ? Timestamp.fromMillis(workout.updatedAt) : undefined,
  };
};

/**
 * Convierte un workout de Firestore a formato local
 */
const fromFirestoreWorkout = (id: string, data: FirestoreWorkout): CardioWorkout => {
  return {
    ...data,
    id,
    startTime: data.startTime.toMillis(),
    endTime: data.endTime?.toMillis(),
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt?.toMillis(),
  };
};

// ==========================================
// CRUD DE ENTRENAMIENTOS
// ==========================================

/**
 * Guarda un nuevo entrenamiento de cardio
 * @param db Instancia de Firestore
 * @param workout Datos del entrenamiento (sin id)
 * @returns ID del documento creado
 */
export const saveWorkout = async (
  db: any, // FirebaseFirestore
  workout: Omit<CardioWorkout, 'id'>
): Promise<string> => {
  try {
    const workoutsRef = collection(db, COLLECTION_WORKOUTS);
    const firestoreData = toFirestoreWorkout(workout);
    
    const docRef = await addDoc(workoutsRef, firestoreData);
    
    // Actualizar estadísticas del usuario
    await updateUserStats(db, workout.oderId, workout);
    
    return docRef.id;
  } catch (error) {
    console.error('Error guardando workout:', error);
    throw new Error('No se pudo guardar el entrenamiento');
  }
};

/**
 * Obtiene un entrenamiento por ID
 */
export const getWorkout = async (
  db: any,
  workoutId: string
): Promise<CardioWorkout | null> => {
  try {
    const docRef = doc(db, COLLECTION_WORKOUTS, workoutId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return fromFirestoreWorkout(docSnap.id, docSnap.data() as FirestoreWorkout);
  } catch (error) {
    console.error('Error obteniendo workout:', error);
    throw new Error('No se pudo obtener el entrenamiento');
  }
};

/**
 * Obtiene todos los entrenamientos de un usuario
 */
export const getUserWorkouts = async (
  db: any,
  userId: string,
  filters?: WorkoutFilters,
  maxResults: number = 50
): Promise<CardioWorkout[]> => {
  try {
    const workoutsRef = collection(db, COLLECTION_WORKOUTS);
    
    // Construir query base
    let q = query(
      workoutsRef,
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      limit(maxResults)
    );
    
    // Aplicar filtros opcionales
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    const querySnapshot = await getDocs(q);
    
    const workouts: CardioWorkout[] = [];
    querySnapshot.forEach((doc) => {
      workouts.push(fromFirestoreWorkout(doc.id, doc.data() as FirestoreWorkout));
    });
    
    // Filtros adicionales en cliente (para fechas y distancia)
    let filtered = workouts;
    
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
 * Actualiza un entrenamiento existente
 */
export const updateWorkout = async (
  db: any,
  workoutId: string,
  updates: Partial<CardioWorkout>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_WORKOUTS, workoutId);
    
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    // Convertir timestamps si existen
    if (updates.startTime) {
      updateData.startTime = Timestamp.fromMillis(updates.startTime);
    }
    if (updates.endTime) {
      updateData.endTime = Timestamp.fromMillis(updates.endTime);
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error actualizando workout:', error);
    throw new Error('No se pudo actualizar el entrenamiento');
  }
};

/**
 * Elimina un entrenamiento
 */
export const deleteWorkout = async (
  db: any,
  workoutId: string
): Promise<void> => {
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
export const getUserStats = async (
  db: any,
  userId: string
): Promise<CardioStats | null> => {
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
  db: any,
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
        fastestPace: Infinity,
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
    currentStats.avgPace = currentStats.totalTime / (currentStats.totalDistance / 1000);
    
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
    
    // Actualizar racha (simplificado)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    if (currentStats.lastWorkoutDate) {
      const lastDate = new Date(currentStats.lastWorkoutDate);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((todayTimestamp - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStats.currentStreak += 1;
      } else if (daysDiff > 1) {
        currentStats.currentStreak = 1;
      }
      // Si es el mismo día, no cambia la racha
    } else {
      currentStats.currentStreak = 1;
    }
    
    if (currentStats.currentStreak > currentStats.longestStreak) {
      currentStats.longestStreak = currentStats.currentStreak;
    }
    
    currentStats.lastWorkoutDate = newWorkout.startTime;
    
    // Guardar estadísticas actualizadas
    await updateDoc(docRef, currentStats as any);
  } catch (error) {
    console.error('Error actualizando stats:', error);
    // No lanzar error, las stats son secundarias
  }
};

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Obtiene los entrenamientos de la última semana
 */
export const getWeeklyWorkouts = async (
  db: any,
  userId: string
): Promise<CardioWorkout[]> => {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  return getUserWorkouts(db, userId, {
    dateFrom: weekAgo,
  });
};

/**
 * Obtiene el último entrenamiento del usuario
 */
export const getLastWorkout = async (
  db: any,
  userId: string
): Promise<CardioWorkout | null> => {
  const workouts = await getUserWorkouts(db, userId, undefined, 1);
  return workouts.length > 0 ? workouts[0] : null;
};