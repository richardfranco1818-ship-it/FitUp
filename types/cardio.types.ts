// ==========================================
// TIPOS BASE PARA CARDIO
// ==========================================

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface RoutePoint extends GeoCoordinate {
  distanceFromStart: number;
  elapsedTime: number;
  currentPace?: number;
}

export type CardioWorkoutType = 
  | 'free_run'
  | 'tempo_run'
  | 'interval'
  | 'long_run';

export type WorkoutStatus = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed';

// ==========================================
// CONFIGURACIÓN DE ENTRENAMIENTOS
// ==========================================

export interface TempoRunConfig {
  targetPace: number;
  tolerancePercent: number;
  warmupDuration?: number;
  cooldownDuration?: number;
}

export interface IntervalConfig {
  workDuration: number;
  restDuration: number;
  sets: number;
  targetWorkPace?: number;
}

export interface WorkoutConfig {
  type: CardioWorkoutType;
  targetDuration?: number;
  targetDistance?: number;
  tempoConfig?: TempoRunConfig;
  intervalConfig?: IntervalConfig;
}

// ==========================================
// MÉTRICAS EN TIEMPO REAL
// ==========================================

export interface CurrentMetrics {
  elapsedTime: number;
  totalDistance: number;
  currentSpeed: number;
  currentSpeedKmh: number;
  currentPace: number;
  averageSpeed: number;
  averagePace: number;
  currentLocation: GeoCoordinate | null;
  calories?: number;
  elevation?: number;
}

export type PaceZone = 
  | 'too_slow'
  | 'on_target'
  | 'too_fast';

// ==========================================
// ENTRENAMIENTO COMPLETO
// ==========================================

export interface KilometerSplit {
  km: number;
  time: number;
  pace: number;
  avgSpeed: number;
}

export interface CardioWorkout {
  id?: string;
  userId: string;
  type: CardioWorkoutType;
  status: WorkoutStatus;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  totalDistance: number;
  averageSpeed: number;
  averagePace: number;
  maxSpeed?: number;
  caloriesBurned?: number;
  elevationGain?: number;
  elevationLoss?: number;
  route: RoutePoint[];
  splits: KilometerSplit[];
  config?: WorkoutConfig;
  notes?: string;
  rating?: number;
  createdAt: number;
  updatedAt?: number;
}

// ==========================================
// HISTORIAL Y ESTADÍSTICAS
// ==========================================

export interface CardioStats {
  totalWorkouts: number;
  totalDistance: number;
  totalTime: number;
  totalCalories: number;
  avgDistance: number;
  avgDuration: number;
  avgPace: number;
  longestDistance: number;
  longestDuration: number;
  fastestPace: number;
  workoutsByType: {
    [key in CardioWorkoutType]?: number;
  };
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: number;
}

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

export interface TimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export interface PaceDisplay {
  minutes: number;
  seconds: number;
  formatted: string;
}