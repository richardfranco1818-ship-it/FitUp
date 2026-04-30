// src/services/cyclingService.ts
import { supabase } from '../config/supabase';
import { CyclingWorkout, CyclingStats, CyclingFilters } from '../../types/cycling.types';

// ── HELPERS ──────────────────────────────────────────────────
const toRow = (workout: Omit<CyclingWorkout, 'id'>): Record<string, any> => ({
  user_id:        workout.userId,
  type:           workout.type,
  status:         workout.status,
  start_time:     workout.startTime,
  end_time:       workout.endTime ?? null,
  total_duration: workout.totalDuration ?? 0,
  total_distance: workout.totalDistance ?? 0,
  average_speed:  workout.averageSpeed ?? 0,
  max_speed:      workout.maxSpeed ?? null,
  calories_burned:workout.caloriesBurned ?? 0,
  elevation_gain: workout.elevationGain ?? null,
  elevation_loss: workout.elevationLoss ?? null,
  route:          workout.route ?? [],
  notes:          workout.notes ?? null,
  rating:         workout.rating ?? null,
  created_at:     workout.createdAt ?? Date.now(),
  updated_at:     workout.updatedAt ?? null,
});

const fromRow = (row: Record<string, any>): CyclingWorkout => ({
  id:             row.id,
  userId:         row.user_id,
  type:           row.type,
  status:         row.status,
  startTime:      row.start_time,
  endTime:        row.end_time ?? undefined,
  totalDuration:  row.total_duration,
  totalDistance:  row.total_distance,
  averageSpeed:   row.average_speed,
  maxSpeed:       row.max_speed ?? undefined,
  caloriesBurned: row.calories_burned ?? 0,
  elevationGain:  row.elevation_gain ?? undefined,
  elevationLoss:  row.elevation_loss ?? undefined,
  route:          row.route ?? [],
  notes:          row.notes ?? undefined,
  rating:         row.rating ?? undefined,
  createdAt:      row.created_at,
  updatedAt:      row.updated_at ?? undefined,
});

// ── GUARDAR ──────────────────────────────────────────────────
export const saveCyclingWorkout = async (workout: Omit<CyclingWorkout, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('cycling_workouts')
    .insert(toRow(workout))
    .select('id')
    .single();

  if (error) throw new Error('No se pudo guardar la ruta: ' + error.message);
  return data.id;
};

// ── OBTENER LISTA ────────────────────────────────────────────
export const getUserCyclingWorkouts = async (
  userId: string,
  filters?: CyclingFilters,
  maxResults: number = 50
): Promise<CyclingWorkout[]> => {
  let query = supabase
    .from('cycling_workouts')
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
  if (error) throw new Error('No se pudieron obtener las rutas: ' + error.message);
  return (data ?? []).map(fromRow);
};

// ── ELIMINAR ─────────────────────────────────────────────────
export const deleteCyclingWorkout = async (workoutId: string): Promise<void> => {
  const { error } = await supabase
    .from('cycling_workouts')
    .delete()
    .eq('id', workoutId);

  if (error) throw new Error('No se pudo eliminar la ruta: ' + error.message);
};

// ── ESTADÍSTICAS ─────────────────────────────────────────────
export const getCyclingStats = async (userId: string): Promise<CyclingStats | null> => {
  const { data, error } = await supabase
    .from('cycling_workouts')
    .select('total_duration, total_distance, calories_burned, average_speed, type, start_time')
    .eq('user_id', userId);

  if (error || !data || data.length === 0) return null;

  const totalWorkouts = data.length;
  const totalDistance = data.reduce((s, r) => s + (r.total_distance ?? 0), 0);
  const totalTime     = data.reduce((s, r) => s + (r.total_duration ?? 0), 0);
  const totalCalories = data.reduce((s, r) => s + (r.calories_burned ?? 0), 0);
  const speeds        = data.filter(r => r.average_speed > 0).map(r => r.average_speed);
  const fastestSpeed  = speeds.length ? Math.max(...speeds) : 0;

  const workoutsByType: any = {};
  data.forEach(r => {
    workoutsByType[r.type] = (workoutsByType[r.type] ?? 0) + 1;
  });

  return {
    totalWorkouts,
    totalDistance,
    totalTime,
    totalCalories,
    avgDistance: totalWorkouts ? totalDistance / totalWorkouts : 0,
    avgDuration: totalWorkouts ? totalTime / totalWorkouts     : 0,
    avgSpeed:    totalWorkouts ? data.reduce((s, r) => s + r.average_speed, 0) / totalWorkouts : 0,
    longestDistance: Math.max(...data.map(r => r.total_distance ?? 0)),
    longestDuration: Math.max(...data.map(r => r.total_duration ?? 0)),
    fastestSpeed,
    workoutsByType,
    lastWorkoutDate: data.length ? data[0].start_time : undefined,
  };
};