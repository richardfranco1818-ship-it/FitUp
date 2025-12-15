/**
 * Tipos para el módulo de Ciclismo
 * FITUP - Exercise App
 */

// Coordenadas GPS (reutilizamos la estructura)
export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

// Punto de ruta
export interface RoutePoint extends GeoCoordinate {
  distanceFromStart: number;
  elapsedTime: number;
  currentPace?: number;
}

// Tipos de entrenamiento de ciclismo
export type CyclingWorkoutType = 
  | 'free_ride'     // Ruta libre
  | 'commute'       // Traslado
  | 'training';     // Entrenamiento

// Estado del entrenamiento
export type WorkoutStatus = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed';

// Entrenamiento de ciclismo completo
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

// Estadísticas del usuario
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

// Filtros para historial
export interface CyclingFilters {
  type?: CyclingWorkoutType;
  dateFrom?: number;
  dateTo?: number;
  minDistance?: number;
  maxDistance?: number;
}