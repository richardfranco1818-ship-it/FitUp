/**
 * SyncStatusBar - Componente de Estado de Sincronización
 * FitUp - Exercise App
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { COLORS } from '../../types';

interface SyncStatusBarProps {
  showAlways?: boolean;
}

const SyncStatusBar: React.FC<SyncStatusBarProps> = ({ showAlways = false }) => {
  const { status, forceSync, isLoading } = useNetworkStatus();
  
  // Determinar si debemos mostrar la barra
  const shouldShow = showAlways || 
    !status.isOnline || 
    status.pendingOperations > 0 ||
    status.syncStatus === 'syncing' ||
    status.syncStatus === 'error';
  
  if (!shouldShow) {
    return null;
  }

  // Determinar colores y mensajes según el estado
  const getStatusConfig = () => {
    if (!status.isOnline) {
      return {
        backgroundColor: '#FF9800',
        icon: 'cloud-off' as const,
        message: 'Sin conexión',
        subMessage: `${status.pendingOperations} pendientes`,
      };
    }
    
    if (status.syncStatus === 'syncing') {
      return {
        backgroundColor: '#2196F3',
        icon: 'sync' as const,
        message: 'Sincronizando...',
        subMessage: null,
      };
    }
    
    if (status.syncStatus === 'error') {
      return {
        backgroundColor: '#F44336',
        icon: 'error-outline' as const,
        message: 'Error de sincronización',
        subMessage: 'Toca para reintentar',
      };
    }
    
    if (status.pendingOperations > 0) {
      return {
        backgroundColor: '#4CAF50',
        icon: 'cloud-upload' as const,
        message: 'Conectado',
        subMessage: `${status.pendingOperations} pendientes`,
      };
    }
    
    return {
      backgroundColor: '#4CAF50',
      icon: 'cloud-done' as const,
      message: 'Todo sincronizado',
      subMessage: `Última: ${status.lastSync}`,
    };
  };

  const config = getStatusConfig();

  const handlePress = async () => {
    if (!isLoading && status.isOnline && status.pendingOperations > 0) {
      try {
        await forceSync();
      } catch (error) {
        console.error('Error en sincronización manual:', error);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: config.backgroundColor }]}
      onPress={handlePress}
      disabled={isLoading || !status.isOnline}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {isLoading || status.syncStatus === 'syncing' ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <MaterialIcons name={config.icon} size={20} color="#FFFFFF" />
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.message}>{config.message}</Text>
        {config.subMessage && (
          <Text style={styles.subMessage}>{config.subMessage}</Text>
        )}
      </View>
      
      {status.isOnline && status.pendingOperations > 0 && !isLoading && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{status.pendingOperations}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  subMessage: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SyncStatusBar;