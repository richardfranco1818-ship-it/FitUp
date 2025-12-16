// Categorías de ejercicios
export type ExerciseCategory = 
  | 'pecho'
  | 'espalda'
  | 'pierna'
  | 'hombro'
  | 'biceps'
  | 'triceps'
  | 'abdomen'
  | 'cardio';

// Ejercicio predefinido
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  icon: string;
}

// Serie de un ejercicio
export interface ExerciseSet {
  setNumber: number;
  weight: number;      // kg
  reps: number;        // repeticiones
  completed: boolean;
}

// Ejercicio realizado en el entrenamiento
export interface WorkoutExercise {
  exercise: Exercise;
  sets: ExerciseSet[];
  notes?: string;
}

// Estado del entrenamiento
export type GymWorkoutStatus = 
  | 'idle'
  | 'in_progress'
  | 'completed';

// Entrenamiento de gym completo
export interface GymWorkout {
  id?: string;
  oderId: string;
  
  status: GymWorkoutStatus;
  
  startTime: number;
  endTime?: number;
  totalDuration: number;    // segundos
  
  exercises: WorkoutExercise[];
  
  totalVolume: number;      // kg totales (peso x reps)
  totalSets: number;
  totalReps: number;
  
  notes?: string;
  rating?: number;
  
  createdAt: number;
  updatedAt?: number;
}

// Estadísticas del usuario
export interface GymStats {
  totalWorkouts: number;
  totalVolume: number;
  totalTime: number;
  totalSets: number;
  totalReps: number;
  
  avgDuration: number;
  avgVolume: number;
  
  favoriteExercises: {
    [exerciseId: string]: number;
  };
  
  lastWorkoutDate?: number;
}

// Filtros para historial
export interface GymFilters {
  dateFrom?: number;
  dateTo?: number;
  exerciseId?: string;
}

// Lista de ejercicios predefinidos
export const EXERCISES_LIST: Exercise[] = [
  // Pecho
  { id: 'press_banca', name: 'Press Banca', category: 'pecho', icon: 'fitness-center' },
  { id: 'press_inclinado', name: 'Press Inclinado', category: 'pecho', icon: 'fitness-center' },
  { id: 'aperturas', name: 'Aperturas', category: 'pecho', icon: 'fitness-center' },
  { id: 'flexiones', name: 'Flexiones', category: 'pecho', icon: 'fitness-center' },
  
  // Espalda
  { id: 'jalon_polea', name: 'Jalón Polea', category: 'espalda', icon: 'fitness-center' },
  { id: 'remo_barra', name: 'Remo con Barra', category: 'espalda', icon: 'fitness-center' },
  { id: 'remo_mancuerna', name: 'Remo Mancuerna', category: 'espalda', icon: 'fitness-center' },
  { id: 'peso_muerto', name: 'Peso Muerto', category: 'espalda', icon: 'fitness-center' },
  
  // Pierna
  { id: 'sentadilla', name: 'Sentadilla', category: 'pierna', icon: 'fitness-center' },
  { id: 'prensa', name: 'Prensa', category: 'pierna', icon: 'fitness-center' },
  { id: 'extension_cuadriceps', name: 'Extensión Cuádriceps', category: 'pierna', icon: 'fitness-center' },
  { id: 'curl_femoral', name: 'Curl Femoral', category: 'pierna', icon: 'fitness-center' },
  { id: 'pantorrilla', name: 'Pantorrilla', category: 'pierna', icon: 'fitness-center' },
  
  // Hombro
  { id: 'press_militar', name: 'Press Militar', category: 'hombro', icon: 'fitness-center' },
  { id: 'elevaciones_laterales', name: 'Elevaciones Laterales', category: 'hombro', icon: 'fitness-center' },
  { id: 'elevaciones_frontales', name: 'Elevaciones Frontales', category: 'hombro', icon: 'fitness-center' },
  { id: 'pajaros', name: 'Pájaros', category: 'hombro', icon: 'fitness-center' },
  
  // Bíceps
  { id: 'curl_biceps_barra', name: 'Curl Bíceps Barra', category: 'biceps', icon: 'fitness-center' },
  { id: 'curl_biceps_mancuerna', name: 'Curl Bíceps Mancuerna', category: 'biceps', icon: 'fitness-center' },
  { id: 'curl_martillo', name: 'Curl Martillo', category: 'biceps', icon: 'fitness-center' },
  
  // Tríceps
  { id: 'triceps_polea', name: 'Tríceps Polea', category: 'triceps', icon: 'fitness-center' },
  { id: 'triceps_frances', name: 'Tríceps Francés', category: 'triceps', icon: 'fitness-center' },
  { id: 'fondos', name: 'Fondos', category: 'triceps', icon: 'fitness-center' },
  
  // Abdomen
  { id: 'crunch', name: 'Crunch', category: 'abdomen', icon: 'fitness-center' },
  { id: 'plancha', name: 'Plancha', category: 'abdomen', icon: 'fitness-center' },
  { id: 'elevacion_piernas', name: 'Elevación de Piernas', category: 'abdomen', icon: 'fitness-center' },
];

// Nombres de categorías para mostrar
export const CATEGORY_NAMES: Record<ExerciseCategory, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  pierna: 'Pierna',
  hombro: 'Hombro',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abdomen: 'Abdomen',
  cardio: 'Cardio',
};

// Colores por categoría
export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  pecho: '#E53935',
  espalda: '#1E88E5',
  pierna: '#43A047',
  hombro: '#FB8C00',
  biceps: '#8E24AA',
  triceps: '#00ACC1',
  abdomen: '#FFB300',
  cardio: '#EC407A',
};