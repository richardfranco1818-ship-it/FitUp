/**
 * SyncService - Servicio de Sincronización con Firebase
 * FitUp - Exercise App
 * 
 * Este servicio procesa la cola de sincronización y envía
 * los datos pendientes a Firebase cuando hay conexión disponible.
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { storageService, SyncQueueItem, WorkoutCollection } from './storageService';
import { saveWorkout as saveCardioToFirebase, deleteWorkout as deleteCardioFromFirebase } from './cardioService';
import { saveCyclingWorkout as saveCyclingToFirebase, deleteCyclingWorkout as deleteCyclingFromFirebase } from './cyclingService';
import { saveGymWorkout as saveGymToFirebase, deleteGymWorkout as deleteGymFromFirebase } from './gymService';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export interface SyncResult {
  success: number;
  failed: number;
  pending: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

// ==========================================
// CLASE DE SINCRONIZACIÓN
// ==========================================

class SyncService {
  private isProcessing: boolean = false;
  private unsubscribeNetInfo: (() => void) | null = null;
  private syncStatus: SyncStatus = 'idle';
  private statusListeners: ((status: SyncStatus) => void)[] = [];

  // ==========================================
  // INICIALIZACIÓN Y LISTENERS
  // ==========================================

  /**
   * Inicia el listener de conectividad
   */
  startNetworkListener(): void {
    console.log('[SyncService] Iniciando listener de red...');
    
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      console.log('[SyncService] Estado de red:', state.isConnected ? 'Online' : 'Offline');
      
      if (state.isConnected) {
        this.updateStatus('idle');
        // Intentar sincronizar cuando vuelve la conexión
        this.processQueue();
      } else {
        this.updateStatus('offline');
      }
    });
  }

  /**
   * Detiene el listener de conectividad
   */
  stopNetworkListener(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
      console.log('[SyncService] Listener de red detenido');
    }
  }

  /**
   * Registra un listener para cambios de estado
   */
  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  /**
   * Actualiza el estado y notifica a los listeners
   */
  private updateStatus(status: SyncStatus): void {
    this.syncStatus = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Obtiene el estado actual
   */
  getStatus(): SyncStatus {
    return this.syncStatus;
  }

  // ==========================================
  // PROCESAMIENTO DE COLA
  // ==========================================

  /**
   * Procesa la cola de sincronización
   */
  async processQueue(): Promise<SyncResult> {
    // Evitar procesamiento concurrente
    if (this.isProcessing) {
      console.log('[SyncService] Ya hay un proceso de sincronización en curso');
      const queue = await storageService.getSyncQueue();
      return { success: 0, failed: 0, pending: queue.length };
    }

    // Verificar conexión
    const isOnline = await storageService.isOnline();
    if (!isOnline) {
      console.log('[SyncService] Sin conexión, omitiendo sincronización');
      this.updateStatus('offline');
      const queue = await storageService.getSyncQueue();
      return { success: 0, failed: 0, pending: queue.length };
    }

    this.isProcessing = true;
    this.updateStatus('syncing');
    
    let success = 0;
    let failed = 0;

    try {
      const queue = await storageService.getSyncQueue();
      console.log(`[SyncService] Procesando ${queue.length} operaciones pendientes`);

      // Ordenar por fecha de creación (FIFO)
      const sortedQueue = queue.sort((a, b) => a.createdAt - b.createdAt);

      for (const item of sortedQueue) {
        try {
          await this.processSingleItem(item);
          await storageService.removeFromSyncQueue(item.id);
          success++;
          console.log(`[SyncService] ✓ Operación ${item.id} completada`);
        } catch (error) {
          console.error(`[SyncService] ✗ Error en operación ${item.id}:`, error);
          await storageService.incrementRetryCount(item.id);
          failed++;
        }
      }

      // Limpiar items que han fallado demasiadas veces
      await storageService.cleanupFailedItems(5);
      
      // Actualizar timestamp de última sincronización
      if (success > 0) {
        await storageService.setLastSyncTime();
      }

      this.updateStatus(failed > 0 ? 'error' : 'idle');
      
    } catch (error) {
      console.error('[SyncService] Error general en sincronización:', error);
      this.updateStatus('error');
    } finally {
      this.isProcessing = false;
    }

    const remainingQueue = await storageService.getSyncQueue();
    
    console.log(`[SyncService] Resultado: ${success} exitosas, ${failed} fallidas, ${remainingQueue.length} pendientes`);
    
    return {
      success,
      failed,
      pending: remainingQueue.length,
    };
  }

  /**
   * Procesa un solo item de la cola
   */
  private async processSingleItem(item: SyncQueueItem): Promise<void> {
    const { collection, action, data } = item;

    switch (action) {
      case 'create':
        await this.handleCreate(collection, data);
        break;
      case 'update':
        await this.handleUpdate(collection, data);
        break;
      case 'delete':
        await this.handleDelete(collection, data.id);
        break;
      default:
        throw new Error(`Acción desconocida: ${action}`);
    }
  }

  /**
   * Maneja operación de creación
   */
  private async handleCreate(collection: WorkoutCollection, data: any): Promise<void> {
    switch (collection) {
      case 'cardioWorkouts':
        await saveCardioToFirebase(data);
        break;
      case 'cyclingWorkouts':
        await saveCyclingToFirebase(data);
        break;
      case 'gymWorkouts':
        await saveGymToFirebase(data);
        break;
    }
  }

  /**
   * Maneja operación de actualización
   */
  private async handleUpdate(collection: WorkoutCollection, data: any): Promise<void> {
    await this.handleCreate(collection, data);
  }

  /**
   * Maneja operación de eliminación
   */
  private async handleDelete(collection: WorkoutCollection, workoutId: string): Promise<void> {
    switch (collection) {
      case 'cardioWorkouts':
        await deleteCardioFromFirebase(workoutId);
        break;
      case 'cyclingWorkouts':
        await deleteCyclingFromFirebase(workoutId);
        break;
      case 'gymWorkouts':
        await deleteGymFromFirebase(workoutId);
        break;
    }
  }

  // ==========================================
  // MÉTODOS DE UTILIDAD
  // ==========================================

  /**
   * Fuerza una sincronización manual
   */
  async forceSync(): Promise<SyncResult> {
    console.log('[SyncService] Sincronización manual iniciada');
    return await this.processQueue();
  }

  /**
   * Obtiene información del estado de sincronización
   */
  async getSyncInfo(): Promise<{
    status: SyncStatus;
    pendingCount: number;
    lastSync: string;
    isOnline: boolean;
  }> {
    const pendingCount = await storageService.getPendingOperationsCount();
    const lastSync = await storageService.getLastSyncFormatted();
    const isOnline = await storageService.isOnline();

    return {
      status: this.syncStatus,
      pendingCount,
      lastSync,
      isOnline,
    };
  }
}

// Exportar instancia única (Singleton)
export const syncService = new SyncService();
export default syncService;