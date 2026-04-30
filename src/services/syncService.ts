// src/services/syncService.ts
// Con Supabase la sincronización se simplifica enormemente.
// Ya no se necesita procesar una cola manual — Supabase maneja
// la persistencia. Este servicio mantiene solo el listener de red
// y el estado de conectividad para el resto de la app.

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { storageService } from './storageService';
import { saveWorkout as saveCardioToSupabase, deleteWorkout as deleteCardioFromSupabase } from './cardioService';
import { saveCyclingWorkout as saveCyclingToSupabase, deleteCyclingWorkout as deleteCyclingFromSupabase } from './cyclingService';
import { saveGymWorkout as saveGymToSupabase, deleteGymWorkout as deleteGymFromSupabase } from './gymService';

export interface SyncResult {
  success: number;
  failed: number;
  pending: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

class SyncService {
  private isProcessing: boolean = false;
  private unsubscribeNetInfo: (() => void) | null = null;
  private syncStatus: SyncStatus = 'idle';
  private statusListeners: ((status: SyncStatus) => void)[] = [];

  // ── Listener de red ───────────────────────────────────────
  startNetworkListener(): void {
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected) {
        this.updateStatus('idle');
        this.processQueue();
      } else {
        this.updateStatus('offline');
      }
    });
  }

  stopNetworkListener(): void {
    this.unsubscribeNetInfo?.();
    this.unsubscribeNetInfo = null;
  }

  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => { this.statusListeners = this.statusListeners.filter(l => l !== listener); };
  }

  private updateStatus(status: SyncStatus): void {
    this.syncStatus = status;
    this.statusListeners.forEach(l => l(status));
  }

  // ── Procesar cola de sincronización pendiente ─────────────
  // Los items pendientes son los que se guardaron offline con los
  // servicios offline (cardioOfflineService, etc.)
  async processQueue(): Promise<SyncResult> {
    if (this.isProcessing) return { success: 0, failed: 0, pending: 0 };
    const isOnline = await storageService.isOnline();
    if (!isOnline) return { success: 0, failed: 0, pending: 0 };

    this.isProcessing = true;
    this.updateStatus('syncing');

    const queue = await storageService.getSyncQueue();
    let success = 0;
    let failed  = 0;

    for (const item of queue) {
      try {
        await this.processItem(item);
        await storageService.removeFromSyncQueue(item.id);
        success++;
      } catch (error) {
        console.error('[SyncService] Error procesando item:', error);
        failed++;
      }
    }

    await storageService.setLastSyncTime();
    this.isProcessing = false;
    this.updateStatus(failed > 0 ? 'error' : 'idle');

    return { success, failed, pending: queue.length - success };
  }

  private async processItem(item: any): Promise<void> {
    const { collection, action, data } = item;

    if (action === 'create') {
      if (collection === 'cardioWorkouts')   await saveCardioToSupabase(data);
      if (collection === 'cyclingWorkouts')  await saveCyclingToSupabase(data);
      if (collection === 'gymWorkouts')      await saveGymToSupabase(data);
    }

    if (action === 'delete') {
      if (collection === 'cardioWorkouts')   await deleteCardioFromSupabase(data.id);
      if (collection === 'cyclingWorkouts')  await deleteCyclingFromSupabase(data.id);
      if (collection === 'gymWorkouts')      await deleteGymFromSupabase(data.id);
    }
  }

  async forceSync(): Promise<SyncResult> {
    return this.processQueue();
  }

  async getSyncInfo() {
    const pendingCount = await storageService.getPendingOperationsCount();
    const lastSync     = await storageService.getLastSyncFormatted();
    const isOnline     = await storageService.isOnline();
    return { status: this.syncStatus, pendingCount, lastSync, isOnline };
  }
}

export const syncService = new SyncService();
export default syncService;