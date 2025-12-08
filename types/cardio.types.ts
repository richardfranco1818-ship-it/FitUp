/**
 * Tipos para el módulo de Cardio/Running
 * FITUP - Exercise App
 */

// ==========================================
// TIPOS BASE PARA CARDIO
// ==========================================

/**
 * Coordenadas GPS
 */
export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number; // m/s
  heading?: number; // grados
  timestamp: number;
}

/**
 * Punto de ruta con métricas
 */
export interface RoutePoint extends GeoCoordinate {
  distanceFromStart: number; // metros
  elapsedTime: number; // segundos
  currentPace?: number; // segundos por km
}

/**
 * Tipos de entrenamiento de cardio
 */
export type CardioWorkoutType = 
  | 'free_run'      // Carrera libre
  | 'tempo_run'     // Tempo run (ritmo constante)
  | 'interval'      // Intervalos
  | 'long_run';     // Carrera larga

/**
 * Estado del entrenamiento
 */
export type WorkoutStatus = 
  | 'idle'          // No iniciado
  | 'running'       // En progreso
  | 'paused'        // Pausado
  | 'completed';    // Terminado

// ==========================================
// CONFIGURACIÓN DE ENTRENAMIENTOS
// ==========================================

/**
 * Configuración para Tempo Run
 */
export interface TempoRunConfig {
  targetPace: number; // Ritmo objetivo en segundos/km (ej: 330 = 5:30 min/km)
  tolerancePercent: number; // Tolerancia en % (ej: 10 = ±10%)
  warmupDuration?: number; // Duración calentamiento en segundos
  cooldownDuration?: number; // Duración enfriamiento en segundos
}

/**
 * Configuración para Intervalos
 */
export interface IntervalConfig {
  workDuration: number; // Duración trabajo en segundos
  restDuration: number; // Duración descanso en segundos
  sets: number; // Número de series
  targetWorkPace?: number; // Ritmo objetivo trabajo
}

/**
 * Configuración general de entrenamiento
 */
export interface WorkoutConfig {
  type: CardioWorkoutType;
  targetDuration?: number; // Duración objetivo en segundos
  targetDistance?: number; // Distancia objetivo en metros
  tempoConfig?: TempoRunConfig;
  intervalConfig?: IntervalConfig;
}

// ==========================================
// MÉTRICAS EN TIEMPO REAL
// ==========================================

/**
 * Métricas actuales del entrenamiento
 */
export interface CurrentMetrics {
  // Tiempo
  elapsedTime: number; // segundos totales
  
  // Distancia
  totalDistance: number; // metros
  
  // Velocidad y Ritmo
  currentSpeed: number; // m/s
  currentSpeedKmh: number; // km/h
  currentPace: number; // segundos/km
  averageSpeed: number; // m/s promedio
  averagePace: number; // segundos/km promedio
  
  // GPS
  currentLocation: GeoCoordinate | null;
  
  // Extras
  calories?: number;
  elevation?: number;
}

/**
 * Estado del ritmo para Tempo Run
 */
export type PaceZone = 
  | 'too_slow'   // Muy lento
  | 'on_target'  // En objetivo
  | 'too_fast';  // Muy rápido

// ==========================================
// ENTRENAMIENTO COMPLETO (para guardar)
// ==========================================

/**
 * Resumen de splits por kilómetro
 */
export interface KilometerSplit {
  km: number;
  time: number; // segundos para ese km
  pace: number; // ritmo en segundos/km
  avgSpeed: number; // velocidad promedio km/h
}

/**
 * Entrenamiento de cardio completo
 */
export interface CardioWorkout {
  // Identificación
  id?: string;
  oderId: string;
  
  // Tipo y estado
  type: CardioWorkoutType;
  status: WorkoutStatus;
  
  // Timestamps
  startTime: number; // timestamp inicio
  endTime?: number; // timestamp fin
  
  // Métricas finales
  totalDuration: number; // segundos
  totalDistance: number; // metros
  averageSpeed: number; // m/s
  averagePace: number; // segundos/km
  maxSpeed?: number; // m/s
  
  // Calorías (estimado)
  caloriesBurned?: number;
  
  // Elevación
  elevationGain?: number;
  elevationLoss?: number;
  
  // Ruta
  route: RoutePoint[];
  
  // Splits
  splits: KilometerSplit[];
  
  // Configuración usada
  config?: WorkoutConfig;
  
  // Notas del usuario
  notes?: string;
  rating?: number; // 1-5 estrellas
  
  // Metadata
  createdAt: number;
  updatedAt?: number;
}

// ==========================================
// HISTORIAL Y ESTADÍSTICAS
// ==========================================

/**
 * Resumen de estadísticas del usuario
 */
export interface CardioStats {
  totalWorkouts: number;
  totalDistance: number; // metros
  totalTime: number; // segundos
  totalCalories: number;
  
  // Promedios
  avgDistance: number;
  avgDuration: number;
  avgPace: number;
  
  // Records
  longestDistance: number;
  longestDuration: number;
  fastestPace: number;
  
  // Por tipo
  workoutsByType: {
    [key in CardioWorkoutType]?: number;
  };
  
  // Racha
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: number;
}

/**
 * Filtros para historial
 */
export interface WorkoutFilters {
  type?: CardioWorkoutType;
  dateFrom?: number;
  dateTo?: number;
  minDistance?: number;
  maxDistance?: number;
}

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Formato de tiempo para mostrar
 */
export interface TimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string; // "01:23:45" o "23:45"
}

/**
 * Formato de ritmo para mostrar
 */
export interface PaceDisplay {
  minutes: number;
  seconds: number;
  formatted: string; // "5:30"
}