// ==========================================
// TIPOS BASE PARA CICLISMO
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

export type CyclingWorkoutType = 
  | 'free_ride'
  | 'commute'
  | 'training';

export type WorkoutStatus = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed';

// ==========================================
// ENTRENAMIENTO COMPLETO
// ==========================================

export interface CyclingWorkout {
  id?: string;
  userId: string;
  type: CyclingWorkoutType;
  status: WorkoutStatus;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  totalDistance: number;
  averageSpeed: number;
  maxSpeed?: number;
  caloriesBurned?: number;
  elevationGain?: number;
  elevationLoss?: number;
  route: RoutePoint[];
  notes?: string;
  rating?: number;
  createdAt: number;
  updatedAt?: number;
}

// ==========================================
// HISTORIAL Y ESTADÍSTICAS
// ==========================================

export interface CyclingStats {
  totalWorkouts: number;
  totalDistance: number;
  totalTime: number;
  totalCalories: number;
  avgDistance: number;
  avgDuration: number;
  avgSpeed: number;
  longestDistance: number;
  longestDuration: number;
  fastestSpeed: number;
  workoutsByType: {
    [key in CyclingWorkoutType]?: number;
  };
  lastWorkoutDate?: number;
}

export interface CyclingFilters {
  type?: CyclingWorkoutType;
  dateFrom?: number;
  dateTo?: number;
  minDistance?: number;
  maxDistance?: number;
}