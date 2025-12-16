import { useState, useRef, useCallback, useEffect } from 'react';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export interface TimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export interface UseStopwatchReturn {
  time: number;
  timeDisplay: TimeDisplay;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  lap: () => number;
  laps: number[];
}

// ==========================================
// UTILIDADES
// ==========================================

const formatTime = (totalSeconds: number): TimeDisplay => {
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

// ==========================================
// HOOK PRINCIPAL
// ==========================================

export const useStopwatch = (
  initialTime: number = 0,
  interval: number = 1000
): UseStopwatchReturn => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ==========================================
  // CONTROLES
  // ==========================================

  const start = useCallback(() => {
    if (isRunning) return;
    
    startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
    setIsRunning(true);
    setIsPaused(false);
    
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTime(elapsed);
    }, interval);
  }, [isRunning, interval]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    pausedTimeRef.current = time;
    setIsRunning(false);
    setIsPaused(true);
  }, [isRunning, isPaused, time]);

  const resume = useCallback(() => {
    if (isRunning || !isPaused) return;
    
    startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
    setIsRunning(true);
    setIsPaused(false);
    
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTime(elapsed);
    }, interval);
  }, [isRunning, isPaused, interval]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTime(initialTime);
    setIsRunning(false);
    setIsPaused(false);
    setLaps([]);
    pausedTimeRef.current = 0;
    startTimeRef.current = 0;
  }, [initialTime]);

  // ==========================================
  // LAP/SPLIT
  // ==========================================

  const lap = useCallback((): number => {
    const lastLapTime = laps.length > 0 ? laps[laps.length - 1] : 0;
    const lapTime = time - lastLapTime;
    setLaps(prev => [...prev, time]);
    return lapTime;
  }, [time, laps]);

  const timeDisplay = formatTime(time);

  return {
    time,
    timeDisplay,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    lap,
    laps,
  };
};

export default useStopwatch;