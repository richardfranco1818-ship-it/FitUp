/**
 * Pantalla de Carrera Libre (Free Run)
 * FITUP - Exercise App
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
  Vibration,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";

// Hooks personalizados
import { useStopwatch } from "../../hooks/useStopwatch";
import { useLocationTracking } from "../../hooks/useLocationTracking";

// Utilidades
import { formatPace } from "../../utils/cardioUtils";

// Tipos
import { CardioWorkout, WorkoutStatus } from "../../../types/cardio.types";

// Colores para esta pantalla (tema oscuro para running)
const COLORS_DARK = {
  background: "#1a1a2e",
  surface: "#16213e",
  surfaceLight: "#1f3460",
  accent: "#4CAF50",
  warning: "#FF9800",
  error: "#f44336",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
};

type FreeRunScreenNavigationProp = StackNavigationProp<RootStackParamList, "FreeRun">;

interface FreeRunScreenProps {
  navigation: FreeRunScreenNavigationProp;
}

const FreeRunScreen: React.FC<FreeRunScreenProps> = ({ navigation }) => {
  const [workoutStatus, setWorkoutStatus] = useState<WorkoutStatus>("idle");
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [startTimestamp, setStartTimestamp] = useState<number>(0);

  // Hook del cronómetro
  const stopwatch = useStopwatch(0, 1000);

  // Hook de tracking GPS
  const locationTracking = useLocationTracking(stopwatch.time);

  // Verificar permisos al montar
  useEffect(() => {
    locationTracking.requestPermission();
  }, []);

  // ==========================================
  // CONTROLES DEL ENTRENAMIENTO
  // ==========================================

  const handleStart = async () => {
    if (locationTracking.hasPermission === false) {
      Alert.alert(
        "Permisos requeridos",
        "Necesitamos acceso a tu ubicación para rastrear tu carrera. Por favor, habilita los permisos en configuración.",
        [{ text: "Entendido" }]
      );
      return;
    }

    Vibration.vibrate(100);
    setWorkoutStatus("running");
    setStartTimestamp(Date.now());
    
    stopwatch.start();
    await locationTracking.startTracking();
  };

  const handlePause = () => {
    Vibration.vibrate(50);
    setWorkoutStatus("paused");
    stopwatch.pause();
    locationTracking.pauseTracking();
  };

  const handleResume = async () => {
    Vibration.vibrate(50);
    setWorkoutStatus("running");
    stopwatch.resume();
    await locationTracking.resumeTracking();
  };

  const handleStop = () => {
    setShowFinishModal(true);
  };

  const confirmFinish = async () => {
    Vibration.vibrate([100, 50, 100]);
    setWorkoutStatus("completed");
    stopwatch.stop();
    locationTracking.stopTracking();
    setShowFinishModal(false);

    // Preparar datos para guardar
    const workoutData: Omit<CardioWorkout, "id"> = {
      oderId: "USER_ID_HERE", // TODO: Obtener del AuthContext
      type: "free_run",
      status: "completed",
      startTime: startTimestamp,
      endTime: Date.now(),
      totalDuration: stopwatch.time,
      totalDistance: locationTracking.metrics.totalDistance,
      averageSpeed: locationTracking.metrics.averageSpeed,
      averagePace: locationTracking.metrics.averagePace,
      caloriesBurned: locationTracking.metrics.calories,
      route: locationTracking.route,
      splits: [],
      createdAt: Date.now(),
    };

    // Navegar a pantalla de resumen
    navigation.navigate("WorkoutSummary", { workout: workoutData });
  };

  const cancelFinish = () => {
    setShowFinishModal(false);
  };

  const handleGoBack = () => {
    if (workoutStatus === "running" || workoutStatus === "paused") {
      Alert.alert(
        "¿Cancelar entrenamiento?",
        "Perderás todo el progreso de esta sesión.",
        [
          { text: "Continuar", style: "cancel" },
          {
            text: "Cancelar",
            style: "destructive",
            onPress: () => {
              stopwatch.reset();
              locationTracking.resetTracking();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // ==========================================
  // RENDERIZADO
  // ==========================================

  const renderMetricCard = (
    label: string,
    value: string,
    unit: string,
    icon: string
  ) => (
    <View style={styles.metricCard}>
      <MaterialIcons name={icon as any} size={20} color={COLORS_DARK.accent} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
    </View>
  );

  const { metrics } = locationTracking;

  // Formatear valores
  const distanceKm = (metrics.totalDistance / 1000).toFixed(2);
  const speedKmh = metrics.currentSpeedKmh.toFixed(1);
  const currentPaceFormatted = formatPace(metrics.currentPace);
  const avgPaceFormatted = formatPace(metrics.averagePace);
  const calories = metrics.calories?.toString() || "0";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS_DARK.background} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS_DARK.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrera Libre</Text>
        <View style={styles.headerRight}>
          {locationTracking.isTracking && (
            <View style={styles.gpsIndicator}>
              <MaterialIcons name="gps-fixed" size={16} color={COLORS_DARK.accent} />
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Estado del entrenamiento */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  workoutStatus === "running"
                    ? COLORS_DARK.accent
                    : workoutStatus === "paused"
                    ? COLORS_DARK.warning
                    : COLORS_DARK.surfaceLight,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {workoutStatus === "idle"
                ? "Listo para comenzar"
                : workoutStatus === "running"
                ? "En progreso"
                : workoutStatus === "paused"
                ? "Pausado"
                : "Completado"}
            </Text>
          </View>
        </View>

        {/* Cronómetro principal */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Tiempo</Text>
          <Text style={styles.timerValue}>{stopwatch.timeDisplay.formatted}</Text>
        </View>

        {/* Métricas principales */}
        <View style={styles.mainMetricsRow}>
          <View style={styles.mainMetricCard}>
            <FontAwesome5 name="route" size={24} color={COLORS_DARK.accent} />
            <Text style={styles.mainMetricValue}>{distanceKm}</Text>
            <Text style={styles.mainMetricLabel}>Kilómetros</Text>
          </View>

          <View style={styles.mainMetricCard}>
            <MaterialIcons name="speed" size={28} color={COLORS_DARK.warning} />
            <Text style={styles.mainMetricValue}>
              {currentPaceFormatted.formatted}
            </Text>
            <Text style={styles.mainMetricLabel}>Ritmo (min/km)</Text>
          </View>
        </View>

        {/* Métricas secundarias */}
        <View style={styles.secondaryMetricsGrid}>
          {renderMetricCard("Velocidad", speedKmh, "km/h", "speed")}
          {renderMetricCard("Ritmo Prom.", avgPaceFormatted.formatted, "min/km", "timer")}
          {renderMetricCard("Calorías", calories, "kcal", "local-fire-department")}
          {renderMetricCard(
            "Precisión GPS",
            metrics.currentLocation?.accuracy?.toFixed(0) || "--",
            "m",
            "gps-fixed"
          )}
        </View>

        {/* Error de GPS */}
        {locationTracking.error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color={COLORS_DARK.error} />
            <Text style={styles.errorText}>{locationTracking.error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Controles */}
      <View style={styles.controlsContainer}>
        {workoutStatus === "idle" && (
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStart}
          >
            <MaterialIcons name="play-arrow" size={40} color={COLORS_DARK.text} />
            <Text style={styles.controlButtonText}>INICIAR</Text>
          </TouchableOpacity>
        )}

        {workoutStatus === "running" && (
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePause}
          >
            <MaterialIcons name="pause" size={36} color={COLORS_DARK.text} />
            <Text style={styles.controlButtonText}>PAUSAR</Text>
          </TouchableOpacity>
        )}

        {workoutStatus === "paused" && (
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
            >
              <MaterialIcons name="stop" size={32} color={COLORS_DARK.text} />
              <Text style={styles.controlButtonTextSmall}>TERMINAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.resumeButton]}
              onPress={handleResume}
            >
              <MaterialIcons name="play-arrow" size={36} color={COLORS_DARK.text} />
              <Text style={styles.controlButtonText}>REANUDAR</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal de confirmación */}
      <Modal
        visible={showFinishModal}
        transparent
        animationType="fade"
        onRequestClose={cancelFinish}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="flag" size={48} color={COLORS_DARK.accent} />
            <Text style={styles.modalTitle}>¿Terminar entrenamiento?</Text>
            <Text style={styles.modalSubtitle}>
              Has recorrido {distanceKm} km en {stopwatch.timeDisplay.formatted}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelFinish}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmFinish}
              >
                <Text style={styles.modalButtonTextConfirm}>Terminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_DARK.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS_DARK.text,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  gpsIndicator: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS_DARK.text,
    fontSize: 12,
    fontWeight: "600",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS_DARK.textSecondary,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 64,
    fontWeight: "200",
    color: COLORS_DARK.text,
    fontVariant: ["tabular-nums"],
  },
  mainMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  mainMetricCard: {
    alignItems: "center",
    backgroundColor: COLORS_DARK.surface,
    borderRadius: 16,
    padding: 20,
    minWidth: 140,
  },
  mainMetricValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS_DARK.text,
    marginTop: 8,
  },
  mainMetricLabel: {
    fontSize: 12,
    color: COLORS_DARK.textSecondary,
    marginTop: 4,
  },
  secondaryMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    width: "48%",
    backgroundColor: COLORS_DARK.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS_DARK.textSecondary,
    marginTop: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS_DARK.text,
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 11,
    color: COLORS_DARK.textSecondary,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS_DARK.error}20`,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    color: COLORS_DARK.error,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  controlsContainer: {
    padding: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 20,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
  },
  startButton: {
    backgroundColor: COLORS_DARK.accent,
    paddingHorizontal: 48,
  },
  pauseButton: {
    backgroundColor: COLORS_DARK.warning,
  },
  resumeButton: {
    backgroundColor: COLORS_DARK.accent,
  },
  stopButton: {
    backgroundColor: COLORS_DARK.error,
  },
  controlButtonText: {
    color: COLORS_DARK.text,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  controlButtonTextSmall: {
    color: COLORS_DARK.text,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS_DARK.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS_DARK.text,
    marginTop: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS_DARK.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: COLORS_DARK.surfaceLight,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS_DARK.accent,
  },
  modalButtonTextCancel: {
    color: COLORS_DARK.text,
    fontWeight: "600",
  },
  modalButtonTextConfirm: {
    color: COLORS_DARK.text,
    fontWeight: "600",
  },
});

export default FreeRunScreen;