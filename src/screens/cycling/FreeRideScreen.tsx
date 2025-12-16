
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Vibration,
  Modal,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useStopwatch } from "../../hooks/useStopwatch";
import { useLocationTracking } from "../../hooks/useLocationTracking";
import { formatTime } from "../../utils/cardioUtils";
import { CyclingWorkout } from "../../../types/cycling.types";

const COLORS = {
  background: "#1a1a2e",
  surface: "#16213e",
  surfaceLight: "#1f3460",
  accent: "#FF9800",
  accentDark: "#F57C00",
  warning: "#FFC107",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
  danger: "#f44336",
};

interface FreeRideScreenProps {
  navigation: any;
}

const FreeRideScreen: React.FC<FreeRideScreenProps> = ({ navigation }) => {
  const [workoutStatus, setWorkoutStatus] = useState<"idle" | "running" | "paused" | "completed">("idle");
  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const stopwatch = useStopwatch();
  const locationTracking = useLocationTracking();

  useEffect(() => {
    return () => {
      if (locationTracking.isTracking) {
        locationTracking.stopTracking();
      }
    };
  }, []);

  const handleStart = async () => {
    Vibration.vibrate(100);
    setWorkoutStatus("running");
    setStartTimestamp(Date.now());
    
    stopwatch.start();
    
    try {
      await locationTracking.startTracking();
    } catch (error) {
      Alert.alert(
        "Permisos requeridos",
        "Necesitamos acceso a tu ubicación para rastrear la ruta. Por favor, habilita los permisos en configuración.",
        [{ text: "Entendido" }]
      );
      setWorkoutStatus("idle");
      stopwatch.reset();
    }
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

    const workoutData: Omit<CyclingWorkout, "id"> = {
      userId: "",
      type: "free_ride",
      status: "completed",
      startTime: startTimestamp,
      endTime: Date.now(),
      totalDuration: stopwatch.time,
      totalDistance: locationTracking.metrics.totalDistance,
      averageSpeed: locationTracking.metrics.averageSpeed,
      maxSpeed: locationTracking.metrics.currentSpeed,
      caloriesBurned: Math.round((locationTracking.metrics.calories || 0) * 0.8),  
      route: locationTracking.route,
      createdAt: Date.now(),
    };

    navigation.navigate("RideSummary", { workout: workoutData });
  };

  const cancelFinish = () => {
    setShowFinishModal(false);
  };

  const handleGoBack = () => {
    if (workoutStatus === "running" || workoutStatus === "paused") {
      Alert.alert(
        "¿Cancelar ruta?",
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

  const { metrics } = locationTracking;

  const distanceKm = (metrics.totalDistance / 1000).toFixed(2);
  const speedKmh = metrics.currentSpeedKmh.toFixed(1);
  const avgSpeedKmh = ((metrics.averageSpeed || 0) * 3.6).toFixed(1);
  const calories = Math.round((metrics.calories || 0) * 0.8).toString();

  const timeFormatted = formatTime(stopwatch.time);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="light-content" />


      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ruta Libre</Text>
        <View style={styles.headerRight}>
          {locationTracking.isTracking && (
            <View style={styles.gpsIndicator}>
              <MaterialIcons name="gps-fixed" size={16} color={COLORS.accent} />
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
   
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  workoutStatus === "running"
                    ? COLORS.accent
                    : workoutStatus === "paused"
                    ? COLORS.warning
                    : COLORS.surfaceLight,
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


        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeFormatted.formatted}</Text>
          <Text style={styles.timerLabel}>Tiempo</Text>
        </View>

+
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <FontAwesome5 name="route" size={20} color={COLORS.accent} />
            <Text style={styles.metricLabel}>Distancia</Text>
            <Text style={styles.metricValue}>{distanceKm}</Text>
            <Text style={styles.metricUnit}>km</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialIcons name="speed" size={22} color={COLORS.accent} />
            <Text style={styles.metricLabel}>Velocidad</Text>
            <Text style={styles.metricValue}>{speedKmh}</Text>
            <Text style={styles.metricUnit}>km/h</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialIcons name="trending-up" size={22} color={COLORS.accent} />
            <Text style={styles.metricLabel}>Vel. Prom.</Text>
            <Text style={styles.metricValue}>{avgSpeedKmh}</Text>
            <Text style={styles.metricUnit}>km/h</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialIcons name="local-fire-department" size={22} color={COLORS.accent} />
            <Text style={styles.metricLabel}>Calorías</Text>
            <Text style={styles.metricValue}>{calories}</Text>
            <Text style={styles.metricUnit}>kcal</Text>
          </View>
        </View>

   
        <View style={styles.controlsContainer}>
          {workoutStatus === "idle" && (
            <TouchableOpacity
              style={[styles.controlButton, styles.startButton]}
              onPress={handleStart}
            >
              <MaterialIcons name="play-arrow" size={40} color={COLORS.text} />
              <Text style={styles.controlButtonText}>INICIAR</Text>
            </TouchableOpacity>
          )}

          {workoutStatus === "running" && (
            <View style={styles.runningControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.pauseButton]}
                onPress={handlePause}
              >
                <MaterialIcons name="pause" size={36} color={COLORS.text} />
                <Text style={styles.controlButtonText}>PAUSAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={handleStop}
              >
                <MaterialIcons name="stop" size={36} color={COLORS.text} />
                <Text style={styles.controlButtonText}>TERMINAR</Text>
              </TouchableOpacity>
            </View>
          )}

          {workoutStatus === "paused" && (
            <View style={styles.runningControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.resumeButton]}
                onPress={handleResume}
              >
                <MaterialIcons name="play-arrow" size={36} color={COLORS.text} />
                <Text style={styles.controlButtonText}>CONTINUAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={handleStop}
              >
                <MaterialIcons name="stop" size={36} color={COLORS.text} />
                <Text style={styles.controlButtonText}>TERMINAR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

 
      <Modal
        visible={showFinishModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelFinish}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FontAwesome5 name="bicycle" size={48} color={COLORS.accent} />
            <Text style={styles.modalTitle}>¿Terminar ruta?</Text>
            <Text style={styles.modalMessage}>
              Has recorrido {distanceKm} km en {timeFormatted.formatted}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={cancelFinish}
              >
                <Text style={styles.modalButtonCancelText}>Continuar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmFinish}
              >
                <Text style={styles.modalButtonConfirmText}>Terminar</Text>
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
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  gpsIndicator: {
    padding: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 14,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  timerText: {
    fontSize: 64,
    fontWeight: "bold",
    color: COLORS.text,
    fontVariant: ["tabular-nums"],
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  metricCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 4,
  },
  metricUnit: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  controlsContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    minWidth: 150,
  },
  startButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 60,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
  },
  resumeButton: {
    backgroundColor: COLORS.accent,
  },
  stopButton: {
    backgroundColor: COLORS.danger,
  },
  controlButtonText: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 4,
  },
  runningControls: {
    flexDirection: "row",
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: COLORS.surfaceLight,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.accent,
  },
  modalButtonCancelText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  modalButtonConfirmText: {
    color: COLORS.text,
    fontWeight: "bold",
  },
});

export default FreeRideScreen;