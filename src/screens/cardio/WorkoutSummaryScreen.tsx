/**
 * Pantalla de Resumen del Entrenamiento
 * FITUP - Exercise App
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { formatTime, formatPace } from "../../utils/cardioUtils";
import { CardioWorkout } from '../../../types/cardio.types';

const COLORS = {
  background: "#1a1a2e",
  surface: "#16213e",
  surfaceLight: "#1f3460",
  accent: "#4CAF50",
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

  const distanceKm = (workout.totalDistance / 1000).toFixed(2);
  const timeFormatted = formatTime(workout.totalDuration);
  const paceFormatted = formatPace(workout.averagePace);
  const speedKmh = ((workout.totalDistance / 1000) / (workout.totalDuration / 3600)).toFixed(1);

  const handleSave = async () => {
    // Aquí guardarías en Firebase
    // await saveWorkout(db, workout);
    Alert.alert("¡Guardado!", "Tu entrenamiento ha sido guardado correctamente.", [
      { text: "OK", onPress: () => navigation.navigate("Home") },
    ]);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header de felicitación */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="emoji-events" size={48} color="#FFD700" />
          </View>
          <Text style={styles.title}>¡Entrenamiento completado!</Text>
          <Text style={styles.subtitle}>Carrera Libre</Text>
        </View>

        {/* Métricas principales */}
        <View style={styles.mainStats}>
          <View style={styles.mainStatItem}>
            <FontAwesome5 name="route" size={24} color={COLORS.accent} />
            <Text style={styles.mainStatValue}>{distanceKm}</Text>
            <Text style={styles.mainStatLabel}>Kilómetros</Text>
          </View>

          <View style={styles.mainStatDivider} />

          <View style={styles.mainStatItem}>
            <MaterialIcons name="timer" size={28} color={COLORS.accent} />
            <Text style={styles.mainStatValue}>{timeFormatted.formatted}</Text>
            <Text style={styles.mainStatLabel}>Tiempo</Text>
          </View>
        </View>

        {/* Métricas secundarias */}
        <View style={styles.secondaryStats}>
          <View style={styles.statCard}>
            <MaterialIcons name="speed" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{paceFormatted.formatted}</Text>
            <Text style={styles.statLabel}>Ritmo (min/km)</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="directions-run" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{speedKmh}</Text>
            <Text style={styles.statLabel}>Velocidad (km/h)</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="local-fire-department" size={24} color="#f44336" />
            <Text style={styles.statValue}>{workout.caloriesBurned || 0}</Text>
            <Text style={styles.statLabel}>Calorías</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="location-on" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{workout.route.length}</Text>
            <Text style={styles.statLabel}>Puntos GPS</Text>
          </View>
        </View>

        {/* Fecha y hora */}
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={18} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>
            {new Date(workout.startTime).toLocaleDateString("es-MX", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
          <MaterialIcons name="delete-outline" size={24} color={COLORS.textSecondary} />
          <Text style={styles.discardText}>Descartar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <MaterialIcons name="save" size={24} color={COLORS.text} />
          <Text style={styles.saveText}>Guardar</Text>
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
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  mainStats: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  mainStatItem: {
    flex: 1,
    alignItems: "center",
  },
  mainStatDivider: {
    width: 1,
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 16,
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
    marginTop: 10,
  },
  dateText: {
    fontSize: 13,
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
  saveText: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default WorkoutSummaryScreen;