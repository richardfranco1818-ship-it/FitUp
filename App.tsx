import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import StackNavigator from "./src/navigation/StackNavigator";
import { syncService } from './src/services/syncService';

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