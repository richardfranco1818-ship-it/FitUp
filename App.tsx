import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import StackNavigator from "./src/navigation/StackNavigator";
import { syncService } from './src/services/syncService';
import 'react-native-get-random-values';

export default function App() {
  useEffect(() => {
    // Iniciar listener de red para offline-first
    syncService.startNetworkListener();
    
    return () => {
      syncService.stopNetworkListener();
    };
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}