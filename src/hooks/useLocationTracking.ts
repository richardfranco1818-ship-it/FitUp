import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { 
  GeoCoordinate, 
  RoutePoint, 
  CurrentMetrics 
} from '../../types/cardio.types';
import {
  calculateDistance,
  msToKmh,
  speedToPace,
  isValidCoordinate,
  estimateCalories,
} from '../utils/cardioUtils';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export interface UseLocationTrackingReturn {
  currentLocation: GeoCoordinate | null;
  metrics: CurrentMetrics;
  route: RoutePoint[];
  isTracking: boolean;
  hasPermission: boolean | null;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  resetTracking: () => void;
}

interface UseLocationTrackingOptions {
  accuracy?: Location.Accuracy;
  timeInterval?: number;
  distanceInterval?: number;
}

// ==========================================
// CONFIGURACIÓN
// ==========================================

const DEFAULT_OPTIONS: UseLocationTrackingOptions = {
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 1000,
  distanceInterval: 5,
};

// ==========================================
// HOOK PRINCIPAL
// ==========================================

export const useLocationTracking = (
  elapsedTime: number = 0,
  options: UseLocationTrackingOptions = {}
): UseLocationTrackingReturn => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Estados
  const [currentLocation, setCurrentLocation] = useState<GeoCoordinate | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Métricas
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  
  // Refs
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastLocationRef = useRef<GeoCoordinate | null>(null);

  // ==========================================
  // PERMISOS
  // ==========================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        setError('Permiso de ubicación denegado');
      }
      
      return granted;
    } catch (err) {
      setError('Error al solicitar permisos');
      setHasPermission(false);
      return false;
    }
  }, []);

  // ==========================================
  // PROCESAMIENTO DE UBICACIÓN
  // ==========================================

  const handleLocationUpdate = useCallback((location: Location.LocationObject) => {
    const newCoord: GeoCoordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude ?? undefined,
      accuracy: location.coords.accuracy ?? undefined,
      speed: location.coords.speed ?? undefined,
      heading: location.coords.heading ?? undefined,
      timestamp: location.timestamp,
    };

    if (!isValidCoordinate(newCoord)) {
      return;
    }

    setCurrentLocation(newCoord);

    let distanceFromLast = 0;
    if (lastLocationRef.current) {
      distanceFromLast = calculateDistance(lastLocationRef.current, newCoord);
      
      if (distanceFromLast > 100) {
        return;
      }
    }

    setTotalDistance(prev => {
      const newTotal = prev + distanceFromLast;
      
      const routePoint: RoutePoint = {
        ...newCoord,
        distanceFromStart: newTotal,
        elapsedTime: elapsedTime,
        currentPace: newCoord.speed ? speedToPace(newCoord.speed) : undefined,
      };
      
      setRoute(prevRoute => [...prevRoute, routePoint]);
      
      return newTotal;
    });

    if (newCoord.speed && newCoord.speed > maxSpeed) {
      setMaxSpeed(newCoord.speed);
    }

    lastLocationRef.current = newCoord;
  }, [elapsedTime, maxSpeed]);

  // ==========================================
  // CONTROLES DE TRACKING
  // ==========================================

  const startTracking = useCallback(async () => {
    if (hasPermission === null) {
      const granted = await requestPermission();
      if (!granted) return;
    } else if (!hasPermission) {
      setError('No hay permisos de ubicación');
      return;
    }

    setError(null);
    setIsTracking(true);
    setIsPaused(false);

    try {
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: mergedOptions.accuracy,
      });
      
      handleLocationUpdate(initialLocation);

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: mergedOptions.accuracy,
          timeInterval: mergedOptions.timeInterval,
          distanceInterval: mergedOptions.distanceInterval,
        },
        handleLocationUpdate
      );
    } catch (err) {
      setError('Error al iniciar tracking GPS');
      setIsTracking(false);
    }
  }, [hasPermission, requestPermission, handleLocationUpdate, mergedOptions]);

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
    setIsPaused(false);
  }, []);

  const pauseTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsPaused(true);
    setIsTracking(false);
  }, []);

  const resumeTracking = useCallback(async () => {
    if (!isPaused) return;
    
    setIsPaused(false);
    setIsTracking(true);

    try {
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: mergedOptions.accuracy,
          timeInterval: mergedOptions.timeInterval,
          distanceInterval: mergedOptions.distanceInterval,
        },
        handleLocationUpdate
      );
    } catch (err) {
      setError('Error al reanudar tracking');
      setIsTracking(false);
    }
  }, [isPaused, handleLocationUpdate, mergedOptions]);

  const resetTracking = useCallback(() => {
    stopTracking();
    setCurrentLocation(null);
    setRoute([]);
    setTotalDistance(0);
    setMaxSpeed(0);
    setError(null);
    lastLocationRef.current = null;
  }, [stopTracking]);

  // ==========================================
  // CLEANUP Y MÉTRICAS
  // ==========================================

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  const currentSpeed = currentLocation?.speed ?? 0;
  const currentSpeedKmh = msToKmh(currentSpeed);
  const currentPace = speedToPace(currentSpeed);
  const averageSpeed = elapsedTime > 0 ? totalDistance / elapsedTime : 0;
  const averagePace = speedToPace(averageSpeed);
  const calories = estimateCalories(totalDistance, elapsedTime);

  const metrics: CurrentMetrics = {
    elapsedTime,
    totalDistance,
    currentSpeed,
    currentSpeedKmh,
    currentPace,
    averageSpeed,
    averagePace,
    currentLocation,
    calories,
  };

  return {
    currentLocation,
    metrics,
    route,
    isTracking,
    hasPermission,
    error,
    requestPermission,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    resetTracking,
  };
};

export default useLocationTracking;