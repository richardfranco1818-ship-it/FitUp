import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { syncService, SyncStatus, SyncResult } from '../services/syncService';
import { storageService } from '../services/storageService';

export interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string | null;
  syncStatus: SyncStatus;
  pendingOperations: number;
  lastSync: string;
}

export interface UseNetworkStatusReturn {
  status: NetworkStatus;
  forceSync: () => Promise<SyncResult>;
  isLoading: boolean;
  error: string | null;
}

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    isConnected: true,
    connectionType: null,
    syncStatus: 'idle',
    pendingOperations: 0,
    lastSync: 'Nunca sincronizado',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actualizar estado de red
  const updateNetworkStatus = useCallback(async (netState: NetInfoState) => {
    const pendingCount = await storageService.getPendingOperationsCount();
    const lastSync = await storageService.getLastSyncFormatted();
    
    setStatus(prev => ({
      ...prev,
      isOnline: netState.isConnected === true && netState.isInternetReachable !== false,
      isConnected: netState.isConnected === true,
      connectionType: netState.type,
      pendingOperations: pendingCount,
      lastSync,
    }));
  }, []);

  // Listener de estado de sincronización
  const handleSyncStatusChange = useCallback((syncStatus: SyncStatus) => {
    setStatus(prev => ({
      ...prev,
      syncStatus,
    }));
  }, []);

  // Forzar sincronización
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await syncService.forceSync();
      
      // Actualizar contador de pendientes
      const pendingCount = await storageService.getPendingOperationsCount();
      const lastSync = await storageService.getLastSyncFormatted();
      
      setStatus(prev => ({
        ...prev,
        pendingOperations: pendingCount,
        lastSync,
      }));
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de sincronización';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicializar listeners
  useEffect(() => {
    // Iniciar listener de red
    syncService.startNetworkListener();
    
    // Suscribirse a cambios de red
    const unsubscribeNetInfo = NetInfo.addEventListener(updateNetworkStatus);
    
    // Suscribirse a cambios de estado de sincronización
    const unsubscribeSyncStatus = syncService.addStatusListener(handleSyncStatusChange);
    
    // Obtener estado inicial
    NetInfo.fetch().then(updateNetworkStatus);
    
    // Cleanup
    return () => {
      unsubscribeNetInfo();
      unsubscribeSyncStatus();
      syncService.stopNetworkListener();
    };
  }, [updateNetworkStatus, handleSyncStatusChange]);

  // Actualizar pendientes periódicamente
  useEffect(() => {
    const interval = setInterval(async () => {
      const pendingCount = await storageService.getPendingOperationsCount();
      if (pendingCount !== status.pendingOperations) {
        setStatus(prev => ({
          ...prev,
          pendingOperations: pendingCount,
        }));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [status.pendingOperations]);

  return {
    status,
    forceSync,
    isLoading,
    error,
  };
};

export default useNetworkStatus;