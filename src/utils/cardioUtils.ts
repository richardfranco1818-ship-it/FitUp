/**
 * Utilidades para cálculos de Cardio/Running
 * FITUP - Exercise App
 */

import { 
  GeoCoordinate, 
  TimeDisplay, 
  PaceDisplay,
  PaceZone 
} from '../../types/cardio.types';

// ==========================================
// CÁLCULOS DE DISTANCIA
// ==========================================

/**
 * Calcula la distancia entre dos puntos GPS usando la fórmula de Haversine
 * @param point1 Primer punto GPS
 * @param point2 Segundo punto GPS
 * @returns Distancia en metros
 */
export const calculateDistance = (
  point1: GeoCoordinate,
  point2: GeoCoordinate
): number => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
};

/**
 * Calcula la distancia total de una ruta
 * @param route Array de puntos GPS
 * @returns Distancia total en metros
 */
export const calculateTotalDistance = (route: GeoCoordinate[]): number => {
  if (route.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < route.length; i++) {
    totalDistance += calculateDistance(route[i - 1], route[i]);
  }
  
  return totalDistance;
};

// ==========================================
// CONVERSIONES DE VELOCIDAD Y RITMO
// ==========================================

/**
 * Convierte m/s a km/h
 */
export const msToKmh = (ms: number): number => {
  return ms * 3.6;
};

/**
 * Convierte km/h a m/s
 */
export const kmhToMs = (kmh: number): number => {
  return kmh / 3.6;
};

/**
 * Convierte velocidad (m/s) a ritmo (segundos/km)
 * @param speedMs Velocidad en m/s
 * @returns Ritmo en segundos por kilómetro
 */
export const speedToPace = (speedMs: number): number => {
  if (speedMs <= 0) return 0;
  return 1000 / speedMs; // segundos para recorrer 1km
};

/**
 * Convierte ritmo (segundos/km) a velocidad (m/s)
 */
export const paceToSpeed = (paceSecondsPerKm: number): number => {
  if (paceSecondsPerKm <= 0) return 0;
  return 1000 / paceSecondsPerKm;
};

// ==========================================
// FORMATEO DE TIEMPO
// ==========================================

/**
 * Formatea segundos a estructura de tiempo
 * @param totalSeconds Segundos totales
 * @returns Objeto TimeDisplay con horas, minutos, segundos y formato string
 */
export const formatTime = (totalSeconds: number): TimeDisplay => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  let formatted: string;
  if (hours > 0) {
    formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    formatted = `${pad(minutes)}:${pad(seconds)}`;
  }

  return { hours, minutes, seconds, formatted };
};

/**
 * Formatea ritmo en segundos/km a formato legible
 * @param paceSeconds Ritmo en segundos por km
 * @returns Objeto PaceDisplay con minutos, segundos y formato string
 */
export const formatPace = (paceSeconds: number): PaceDisplay => {
  if (paceSeconds <= 0 || !isFinite(paceSeconds)) {
    return { minutes: 0, seconds: 0, formatted: '--:--' };
  }

  // Limitar a un máximo razonable (30 min/km)
  const cappedPace = Math.min(paceSeconds, 1800);
  
  const minutes = Math.floor(cappedPace / 60);
  const seconds = Math.floor(cappedPace % 60);
  
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return { minutes, seconds, formatted };
};

/**
 * Convierte string de ritmo "5:30" a segundos
 */
export const parsePaceString = (paceString: string): number => {
  const parts = paceString.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  
  if (isNaN(minutes) || isNaN(seconds)) return 0;
  
  return minutes * 60 + seconds;
};

// ==========================================
// CÁLCULOS DE CALORÍAS
// ==========================================

/**
 * Estima las calorías quemadas corriendo
 * Fórmula simplificada basada en MET (Metabolic Equivalent of Task)
 * @param distanceMeters Distancia en metros
 * @param durationSeconds Duración en segundos
 * @param weightKg Peso del usuario en kg (default 70)
 * @returns Calorías estimadas
 */
export const estimateCalories = (
  distanceMeters: number,
  durationSeconds: number,
  weightKg: number = 70
): number => {
  // Velocidad en km/h
  const speedKmh = (distanceMeters / 1000) / (durationSeconds / 3600);
  
  // MET aproximado según velocidad de carrera
  let met: number;
  if (speedKmh < 6) {
    met = 6; // Caminata rápida / trote suave
  } else if (speedKmh < 8) {
    met = 8.3; // Trote ligero
  } else if (speedKmh < 10) {
    met = 9.8; // Carrera moderada
  } else if (speedKmh < 12) {
    met = 11.0; // Carrera rápida
  } else if (speedKmh < 14) {
    met = 11.8; // Carrera muy rápida
  } else {
    met = 12.8; // Sprint
  }
  
  // Fórmula: Calorías = MET × peso (kg) × tiempo (horas)
  const hours = durationSeconds / 3600;
  const calories = met * weightKg * hours;
  
  return Math.round(calories);
};

// ==========================================
// ZONAS DE RITMO (TEMPO RUN)
// ==========================================

/**
 * Determina la zona de ritmo actual vs objetivo
 * @param currentPace Ritmo actual en segundos/km
 * @param targetPace Ritmo objetivo en segundos/km
 * @param tolerancePercent Tolerancia en porcentaje
 * @returns Zona de ritmo
 */
export const getPaceZone = (
  currentPace: number,
  targetPace: number,
  tolerancePercent: number = 10
): PaceZone => {
  if (currentPace <= 0 || !isFinite(currentPace)) return 'on_target';
  
  const tolerance = targetPace * (tolerancePercent / 100);
  const lowerBound = targetPace - tolerance;
  const upperBound = targetPace + tolerance;
  
  if (currentPace < lowerBound) {
    return 'too_fast'; // Ritmo bajo = muy rápido
  } else if (currentPace > upperBound) {
    return 'too_slow'; // Ritmo alto = muy lento
  }
  
  return 'on_target';
};

/**
 * Obtiene el color según la zona de ritmo
 */
export const getPaceZoneColor = (zone: PaceZone): string => {
  switch (zone) {
    case 'too_slow':
      return '#FF5722'; // Naranja/Rojo - acelera
    case 'too_fast':
      return '#2196F3'; // Azul - baja ritmo
    case 'on_target':
      return '#4CAF50'; // Verde - perfecto
    default:
      return '#757575';
  }
};

/**
 * Obtiene el mensaje según la zona de ritmo
 */
export const getPaceZoneMessage = (zone: PaceZone): string => {
  switch (zone) {
    case 'too_slow':
      return '¡Acelera! Vas muy lento';
    case 'too_fast':
      return 'Baja el ritmo, vas muy rápido';
    case 'on_target':
      return '¡Perfecto! Mantén el ritmo';
    default:
      return '';
  }
};

// ==========================================
// VALIDACIONES
// ==========================================

/**
 * Valida si una coordenada GPS es válida
 */
export const isValidCoordinate = (coord: GeoCoordinate | null): boolean => {
  if (!coord) return false;
  
  return (
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180 &&
    (coord.accuracy === undefined || coord.accuracy < 100) // Precisión menor a 100m
  );
};

/**
 * Filtra puntos GPS con mala precisión
 */
export const filterAccuratePoints = (
  points: GeoCoordinate[],
  maxAccuracy: number = 50
): GeoCoordinate[] => {
  return points.filter(
    point => point.accuracy === undefined || point.accuracy <= maxAccuracy
  );
};

// ==========================================
// SPLITS POR KILÓMETRO
// ==========================================

/**
 * Calcula los splits por kilómetro de una ruta
 */
export const calculateKilometerSplits = (
  route: { timestamp: number; distanceFromStart: number }[]
): { km: number; time: number; pace: number; avgSpeed: number }[] => {
  const splits: { km: number; time: number; pace: number; avgSpeed: number }[] = [];
  
  if (route.length < 2) return splits;
  
  let currentKm = 1;
  let lastKmTimestamp = route[0].timestamp;
  
  for (let i = 1; i < route.length; i++) {
    const point = route[i];
    const kmReached = Math.floor(point.distanceFromStart / 1000);
    
    if (kmReached >= currentKm) {
      const splitTime = (point.timestamp - lastKmTimestamp) / 1000; // segundos
      const pace = splitTime; // segundos para 1km
      const avgSpeed = 3600 / pace; // km/h
      
      splits.push({
        km: currentKm,
        time: splitTime,
        pace,
        avgSpeed,
      });
      
      lastKmTimestamp = point.timestamp;
      currentKm++;
    }
  }
  
  return splits;
};