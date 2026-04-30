// src/services/gymService.ts
import { supabase } from '../config/supabase';
import { GymWorkout, GymStats, GymFilters } from '../../types/gym.types';

// ── HELPERS ──────────────────────────────────────────────────
const toRow = (workout: Omit<GymWorkout, 'id'>): Record<string, any> => ({
  user_id:        workout.oderId,   // oderId es el userId en gym.types
  status:         workout.status,
  start_time:     workout.startTime,
  end_time:       workout.endTime ?? null,
  total_duration: workout.totalDuration ?? 0,
  exercises:      workout.exercises ?? [],
  total_volume:   workout.totalVolume ?? 0,
  total_sets:     workout.totalSets ?? 0,
  total_reps:     workout.totalReps ?? 0,
  notes:          workout.notes ?? null,
  rating:         workout.rating ?? null,
  created_at:     workout.createdAt ?? Date.now(),
  updated_at:     workout.updatedAt ?? null,
});

const fromRow = (row: Record<string, any>): GymWorkout => ({
  id:            row.id,
  oderId:        row.user_id,
  status:        row.status,
  startTime:     row.start_time,
  endTime:       row.end_time ?? undefined,
  totalDuration: row.total_duration,
  exercises:     row.exercises ?? [],
  totalVolume:   row.total_volume ?? 0,
  totalSets:     row.total_sets ?? 0,
  totalReps:     row.total_reps ?? 0,
  notes:         row.notes ?? undefined,
  rating:        row.rating ?? undefined,
  createdAt:     row.created_at,
  updatedAt:     row.updated_at ?? undefined,
});

// ── GUARDAR ──────────────────────────────────────────────────
export const saveGymWorkout = async (workout: Omit<GymWorkout, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('gym_workouts')
    .insert(toRow(workout))
    .select('id')
    .single();

  if (error) throw new Error('No se pudo guardar el entrenamiento: ' + error.message);
  return data.id;
};

// ── OBTENER LISTA ─────────────────────────────────────────────
export const getUserGymWorkouts = async (
  userId: string,
  filters?: GymFilters,
  maxResults: number = 50
): Promise<GymWorkout[]> => {
  let query = supabase
    .from('gym_workouts')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(maxResults);

  if (filters?.dateFrom)    query = query.gte('start_time', filters.dateFrom);
  if (filters?.dateTo)      query = query.lte('start_time', filters.dateTo);

  const { data, error } = await query;
  if (error) throw new Error('No se pudieron obtener los entrenamientos: ' + error.message);
  return (data ?? []).map(fromRow);
};

// ── ELIMINAR ─────────────────────────────────────────────────
export const deleteGymWorkout = async (workoutId: string): Promise<void> => {
  const { error } = await supabase
    .from('gym_workouts')
    .delete()
    .eq('id', workoutId);

  if (error) throw new Error('No se pudo eliminar el entrenamiento: ' + error.message);
};

// ── ESTADÍSTICAS ─────────────────────────────────────────────
export const getGymStats = async (userId: string): Promise<GymStats | null> => {
  const { data, error } = await supabase
    .from('gym_workouts')
    .select('total_duration, total_volume, total_sets, total_reps, exercises, start_time')
    .eq('user_id', userId);

  if (error || !data || data.length === 0) return null;

  const totalWorkouts = data.length;
  const totalVolume   = data.reduce((s, r) => s + (r.total_volume ?? 0), 0);
  const totalTime     = data.reduce((s, r) => s + (r.total_duration ?? 0), 0);
  const totalSets     = data.reduce((s, r) => s + (r.total_sets ?? 0), 0);
  const totalReps     = data.reduce((s, r) => s + (r.total_reps ?? 0), 0);

  const favoriteExercises: Record<string, number> = {};
  data.forEach(row => {
    (row.exercises ?? []).forEach((ex: any) => {
      const exId = ex.exercise?.id;
      if (exId) favoriteExercises[exId] = (favoriteExercises[exId] ?? 0) + 1;
    });
  });

  return {
    totalWorkouts,
    totalVolume,
    totalTime,
    totalSets,
    totalReps,
    avgDuration: totalWorkouts ? totalTime / totalWorkouts     : 0,
    avgVolume:   totalWorkouts ? totalVolume / totalWorkouts   : 0,
    favoriteExercises,
    lastWorkoutDate: data.length ? data[0].start_time : undefined,
  };
};