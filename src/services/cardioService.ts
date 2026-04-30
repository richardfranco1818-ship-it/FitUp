// src/services/cardioService.ts
import { supabase } from '../config/supabase';
import { CardioWorkout, CardioStats, WorkoutFilters } from '../../types/cardio.types';

// ── HELPERS ──────────────────────────────────────────────────
const toRow = (workout: Omit<CardioWorkout, 'id'>): Record<string, any> => ({
  user_id:        workout.userId,
  type:           workout.type,
  status:         workout.status,
  start_time:     workout.startTime,
  end_time:       workout.endTime ?? null,
  total_duration: workout.totalDuration ?? 0,
  total_distance: workout.totalDistance ?? 0,
  average_speed:  workout.averageSpeed ?? 0,
  average_pace:   workout.averagePace ?? 0,
  max_speed:      workout.maxSpeed ?? null,
  calories_burned:workout.caloriesBurned ?? 0,
  elevation_gain: workout.elevationGain ?? null,
  elevation_loss: workout.elevationLoss ?? null,
  route:          workout.route ?? [],
  splits:         workout.splits ?? [],
  config:         workout.config ?? null,
  notes:          workout.notes ?? null,
  rating:         workout.rating ?? null,
  created_at:     workout.createdAt ?? Date.now(),
  updated_at:     workout.updatedAt ?? null,
});

const fromRow = (row: Record<string, any>): CardioWorkout => ({
  id:             row.id,
  userId:         row.user_id,
  type:           row.type,
  status:         row.status,
  startTime:      row.start_time,
  endTime:        row.end_time ?? undefined,
  totalDuration:  row.total_duration,
  totalDistance:  row.total_distance,
  averageSpeed:   row.average_speed,
  averagePace:    row.average_pace,
  maxSpeed:       row.max_speed ?? undefined,
  caloriesBurned: row.calories_burned ?? 0,
  elevationGain:  row.elevation_gain ?? undefined,
  elevationLoss:  row.elevation_loss ?? undefined,
  route:          row.route ?? [],
  splits:         row.splits ?? [],
  config:         row.config ?? undefined,
  notes:          row.notes ?? undefined,
  rating:         row.rating ?? undefined,
  createdAt:      row.created_at,
  updatedAt:      row.updated_at ?? undefined,
});

// ── GUARDAR ──────────────────────────────────────────────────
export const saveWorkout = async (workout: Omit<CardioWorkout, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('cardio_workouts')
    .insert(toRow(workout))
    .select('id')
    .single();

  if (error) throw new Error('No se pudo guardar el entrenamiento: ' + error.message);
  return data.id;
};

// ── OBTENER LISTA ────────────────────────────────────────────
export const getUserWorkouts = async (
  userId: string,
  filters?: WorkoutFilters,
  maxResults: number = 50
): Promise<CardioWorkout[]> => {
  let query = supabase
    .from('cardio_workouts')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(maxResults);

  if (filters?.type)        query = query.eq('type', filters.type);
  if (filters?.dateFrom)    query = query.gte('start_time', filters.dateFrom);
  if (filters?.dateTo)      query = query.lte('start_time', filters.dateTo);
  if (filters?.minDistance) query = query.gte('total_distance', filters.minDistance);
  if (filters?.maxDistance) query = query.lte('total_distance', filters.maxDistance);

  const { data, error } = await query;
  if (error) throw new Error('No se pudieron obtener los entrenamientos: ' + error.message);
  return (data ?? []).map(fromRow);
};

// ── ELIMINAR ─────────────────────────────────────────────────
export const deleteWorkout = async (workoutId: string): Promise<void> => {
  const { error } = await supabase
    .from('cardio_workouts')
    .delete()
    .eq('id', workoutId);

  if (error) throw new Error('No se pudo eliminar el entrenamiento: ' + error.message);
};

// ── ESTADÍSTICAS ─────────────────────────────────────────────
export const getUserStats = async (userId: string): Promise<CardioStats | null> => {
  const { data, error } = await supabase
    .from('cardio_workouts')
    .select('total_duration, total_distance, calories_burned, average_pace, type, start_time')
    .eq('user_id', userId);

  if (error || !data || data.length === 0) return null;

  const totalWorkouts  = data.length;
  const totalDistance  = data.reduce((s, r) => s + (r.total_distance ?? 0), 0);
  const totalTime      = data.reduce((s, r) => s + (r.total_duration ?? 0), 0);
  const totalCalories  = data.reduce((s, r) => s + (r.calories_burned ?? 0), 0);
  const paces          = data.filter(r => r.average_pace > 0).map(r => r.average_pace);
  const fastestPace    = paces.length ? Math.min(...paces) : 9999;

  const workoutsByType: any = {};
  data.forEach(r => {
    workoutsByType[r.type] = (workoutsByType[r.type] ?? 0) + 1;
  });

  return {
    totalWorkouts,
    totalDistance,
    totalTime,
    totalCalories,
    avgDistance:  totalWorkouts ? totalDistance / totalWorkouts : 0,
    avgDuration:  totalWorkouts ? totalTime / totalWorkouts     : 0,
    avgPace:      totalDistance > 0 ? totalTime / (totalDistance / 1000) : 0,
    longestDistance: Math.max(...data.map(r => r.total_distance ?? 0)),
    longestDuration: Math.max(...data.map(r => r.total_duration ?? 0)),
    fastestPace,
    workoutsByType,
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: data.length ? data[0].start_time : undefined,
  };
};

export const updateUserStats = async (): Promise<void> => {
  // Con Supabase las estadísticas se calculan en tiempo real desde getUserStats
  // No se necesita guardar un documento separado como en Firestore
};