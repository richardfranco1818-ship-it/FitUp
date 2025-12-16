import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { formatTime, formatPace } from "../../utils/cardioUtils";
import { CardioWorkout } from '../../../types/cardio.types';
import { saveWorkout } from '../../services/cardioService';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  background: "#1a1a2e",
  surface: "#16213e",
  surfaceLight: "#1f3460",
  accent: "#4CAF50",
  error: "#f44336",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
};

interface WorkoutSummaryScreenProps {
  navigation: any;
  route: {
    params: {
      workout: Omit<CardioWorkout, "id">;
    };
  };
}

const WorkoutSummaryScreen: React.FC<WorkoutSummaryScreenProps> = ({
  navigation,
  route,
}) => {
  const { workout } = route.params;
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const distanceKm = (workout.totalDistance / 1000).toFixed(2);
  const timeFormatted = formatTime(workout.totalDuration);
  const paceFormatted = formatPace(workout.averagePace);
  const speedKmh = workout.totalDuration > 0 
    ? ((workout.totalDistance / 1000) / (workout.totalDuration / 3600)).toFixed(1)
    : "0.0";

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "No se pudo identificar al usuario");
      return;
    }

    setIsSaving(true);
    
    try {
      // Agregar el userId correcto al workout
      const workoutWithUser = {
        ...workout,
        userId: user.uid,
      };

      await saveWorkout(workoutWithUser);
      
      Alert.alert(
        "¡Guardado!", 
        "Tu entrenamiento ha sido guardado correctamente.", 
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert(
        "Error", 
        "No se pudo guardar el entrenamiento. Intenta de nuevo.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      "¿Descartar entrenamiento?",
      "Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => navigation.navigate("Home"),
        },
      ]
    );
  };

  // Formatear fecha
  const workoutDate = new Date(workout.startTime);
  const dateString = workoutDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeString = workoutDate.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen</Text>
        <View style={styles.headerSubtitle}>
          <MaterialIcons name="check-circle" size={24} color={COLORS.accent} />
          <Text style={styles.completedText}>¡Entrenamiento completado!</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Estadísticas principales */}
        <View style={styles.mainStats}>
          <View style={styles.mainStatCard}>
            <FontAwesome5 name="route" size={28} color={COLORS.accent} />
            <Text style={styles.mainStatValue}>{distanceKm}</Text>
            <Text style={styles.mainStatLabel}>Kilómetros</Text>
          </View>

          <View style={styles.mainStatCard}>
            <MaterialIcons name="timer" size={32} color="#2196F3" />
            <Text style={styles.mainStatValue}>{timeFormatted.formatted}</Text>
            <Text style={styles.mainStatLabel}>Tiempo</Text>
          </View>
        </View>

        {/* Estadísticas secundarias */}
        <View style={styles.secondaryStats}>
          <View style={styles.statCard}>
            <MaterialIcons name="speed" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{paceFormatted.formatted}</Text>
            <Text style={styles.statLabel}>Ritmo (min/km)</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="directions-run" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{speedKmh}</Text>
            <Text style={styles.statLabel}>Velocidad (km/h)</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="local-fire-department" size={24} color="#F44336" />
            <Text style={styles.statValue}>{workout.caloriesBurned || 0}</Text>
            <Text style={styles.statLabel}>Calorías</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="location-on" size={24} color="#00BCD4" />
            <Text style={styles.statValue}>{workout.route?.length || 0}</Text>
            <Text style={styles.statLabel}>Puntos GPS</Text>
          </View>
        </View>

        {/* Fecha y hora */}
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={20} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{dateString}</Text>
        </View>
        <View style={styles.dateContainer}>
          <MaterialIcons name="access-time" size={20} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{timeString}</Text>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.discardButton} 
          onPress={handleDiscard}
          disabled={isSaving}
        >
          <MaterialIcons name="delete-outline" size={24} color={COLORS.textSecondary} />
          <Text style={styles.discardText}>Descartar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <>
              <MaterialIcons name="save" size={24} color={COLORS.text} />
              <Text style={styles.saveText}>Guardar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  mainStatCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    minWidth: 140,
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
  },
  mainStatLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  secondaryStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  discardButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  discardText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginLeft: 8,
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default WorkoutSummaryScreen;