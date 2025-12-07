/**
 * Archivo central para todos los tipos TypeScript de FitUp
 * Tipos e interfaces para la aplicación de ejercicio
 */

// ==========================================
// TIPOS BÁSICOS DE LA APLICACIÓN
// ==========================================

export type ID = number;

/**
 * Tipos de actividad física disponibles
 */
export type TipoActividad = "cardio" | "pesas" | "yoga" | "crossfit" | "natacion" | "ciclismo";

/**
 * Objetivos de fitness del usuario
 */
export type ObjetivoFitness = "perder_peso" | "ganar_musculo" | "mantenerse" | "resistencia";

// ==========================================
// INTERFACES DE ENTIDADES PRINCIPALES
// ==========================================

export interface BaseEntity {
  id: ID;
}

/**
 * Perfil del usuario
 */
export interface Usuario extends BaseEntity {
  nombre: string;
  email?: string;
  telefono?: string;
  peso?: number;      // kg
  altura?: number;    // cm
  edad?: number;
  objetivo?: ObjetivoFitness;
  fotoPerfil?: string;
}

/**
 * Ejercicio individual
 */
export interface Ejercicio extends BaseEntity {
  nombre: string;
  tipo: TipoActividad;
  series?: number;
  repeticiones?: number;
  peso?: number;        // kg
  duracion?: number;    // minutos
  descanso?: number;    // segundos
  descripcion?: string;
}

/**
 * Entrenamiento (sesión completa)
 */
export interface Entrenamiento extends BaseEntity {
  nombre: string;
  tipo: TipoActividad;
  fecha: string;
  duracion: number;     // minutos
  calorias?: number;
  ejercicios?: Ejercicio[];
  notas?: string;
  completado: boolean;
}

/**
 * Rutina (plantilla de entrenamiento)
 */
export interface Rutina extends BaseEntity {
  nombre: string;
  tipo: TipoActividad;
  ejercicios: Ejercicio[];
  descripcion?: string;
  nivel?: "principiante" | "intermedio" | "avanzado";
}

/**
 * Registro de progreso
 */
export interface ProgresoRegistro extends BaseEntity {
  fecha: string;
  peso?: number;
  notas?: string;
  fotosProgreso?: string[];
}

// ==========================================
// TIPOS PARA COMPONENTES UI
// ==========================================

export interface CardProps {
  titulo: string;
  subtitulo?: string;
  onPress?: () => void;
  icono?: string;
  imagen?: any;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  titulo?: string;
  children?: React.ReactNode;
}

export interface ListItemProps<T> {
  item: T;
  onPress?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

// ==========================================
// TIPOS PARA FORMULARIOS
// ==========================================

export interface LoginFormData {
  username: string;
  password: string;
}

export interface EntrenamientoFormData {
  nombre: string;
  tipo: TipoActividad;
  duracion: number;
  calorias?: number;
  notas?: string;
}

export interface EjercicioFormData {
  nombre: string;
  tipo: TipoActividad;
  series?: number;
  repeticiones?: number;
  peso?: number;
  duracion?: number;
}

export interface PerfilFormData {
  nombre: string;
  email?: string;
  peso?: number;
  altura?: number;
  edad?: number;
  objetivo?: ObjetivoFitness;
}

// ==========================================
// TIPOS PARA GESTIÓN DE ESTADOS
// ==========================================

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface ScreenState<T> {
  data: T[];
  loading: LoadingState;
  error: ErrorState;
}

// ==========================================
// TIPOS PARA NAVEGACIÓN
// ==========================================

export interface ScreenProps<T = any> {
  navigation: any;
  route: {
    params?: T;
  };
}

export interface DetailScreenParams {
  id: ID;
  nombre: string;
}

export interface ActivityScreenParams {
  activityName: string;
  activityIcon: string;
  activityIconLibrary: "FontAwesome5" | "MaterialIcons" | "Entypo";
  activityColor: string;
}

// ==========================================
// TIPOS UTILITARIOS
// ==========================================

export type PartialExceptId<T extends BaseEntity> = {
  id: ID;
} & Partial<Omit<T, "id">>;

export type CreateEntity<T extends BaseEntity> = Omit<T, "id">;

export type CRUDOperation = "create" | "read" | "update" | "delete";

// ==========================================
// CONSTANTES
// ==========================================

export const COLORS = {
  primary: "#0A2647",
  secondary: "#3585e6ff",
  background: "#f5f5f5",
  surface: "#ffffff",
  error: "#b00020",
  text: "#000000",
  textSecondary: "#777777",
  base: "#6200ea",
  base2: "#25c4d6ff",
  // Colores para actividades
  cardio: "#2196F3",
  pesas: "#2c842c",
  yoga: "#9C27B0",
  crossfit: "#FF5722",
  natacion: "#00BCD4",
  ciclismo: "#FF9800",
};

export const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
  xxlarge: 24,
};

/**
 * Configuración de actividades para el HomeScreen
 */
export const ACTIVIDADES_CONFIG = [
  { id: "cardio", nombre: "Cardio", icono: "running", color: COLORS.cardio },
  { id: "pesas", nombre: "Pesas", icono: "dumbbell", color: COLORS.pesas },
  { id: "yoga", nombre: "Yoga", icono: "spa", color: COLORS.yoga },
  { id: "crossfit", nombre: "CrossFit", icono: "fitness-center", color: COLORS.crossfit },
  { id: "natacion", nombre: "Natación", icono: "swimmer", color: COLORS.natacion },
  { id: "ciclismo", nombre: "Ciclismo", icono: "bicycle", color: COLORS.ciclismo },
];