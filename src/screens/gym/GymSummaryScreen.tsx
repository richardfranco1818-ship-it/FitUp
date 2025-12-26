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
import { formatTime } from "../../utils/cardioUtils";
import { GymWorkout, CATEGORY_NAMES, CATEGORY_COLORS } from "../../../types/gym.types";
import { saveGymWorkout } from "../../services/gymService";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  background: "#1a1a2e",
  surface: "#16213e",
  surfaceLight: "#1f3460",
  accent: "#4CAF50",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
};

interface GymSummaryScreenProps {
  navigation: any;
  route: {
    params: {
      workout: Omit<GymWorkout, "id">;
    };
  };
}

const GymSummaryScreen: React.FC<GymSummaryScreenProps> = ({ navigation, route }) => {
  const { workout } = route.params;
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const timeFormatted = formatTime(workout.totalDuration);

  // Formatear fecha
  const workoutDate = new Date(workout.startTime);
  const dateString = workoutDate.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeString = workoutDate.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "No se pudo identificar al usuario");
      return;
    }

    setIsSaving(true);

    try {
      const workoutWithUser = {
        ...workout,
        oderId: user.uid,
      };

      await saveGymWorkout(workoutWithUser);

      Alert.alert(
        "¡Guardado!",
        "Tu entrenamiento ha sido guardado correctamente.",
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo guardar el entrenamiento. Intenta de nuevo.");
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
            <FontAwesome5 name="dumbbell" size={28} color={COLORS.accent} />
            <Text style={styles.mainStatValue}>{workout.totalVolume.toLocaleString()}</Text>
            <Text style={styles.mainStatLabel}>kg Totales</Text>
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
            <MaterialIcons name="fitness-center" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{workout.exercises.length}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="repeat" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{workout.totalSets}</Text>
            <Text style={styles.statLabel}>Series</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={24} color="#00BCD4" />
            <Text style={styles.statValue}>{workout.totalReps}</Text>
            <Text style={styles.statLabel}>Repeticiones</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="speed" size={24} color="#F44336" />
            <Text style={styles.statValue}>
              {workout.totalSets > 0
                ? Math.round(workout.totalVolume / workout.totalSets)
                : 0}
            </Text>
            <Text style={styles.statLabel}>kg/Serie Prom</Text>
          </View>
        </View>

        {/* Detalle de ejercicios */}
        <Text style={styles.sectionTitle}>Ejercicios realizados</Text>
        {workout.exercises.map((we, index) => (
          <View key={index} style={styles.exerciseDetail}>
            <View style={styles.exerciseDetailHeader}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: CATEGORY_COLORS[we.exercise.category] },
                ]}
              />
              <View style={styles.exerciseDetailInfo}>
                <Text style={styles.exerciseDetailName}>{we.exercise.name}</Text>
                <Text style={styles.exerciseDetailCategory}>
                  {CATEGORY_NAMES[we.exercise.category]}
                </Text>
              </View>
              <Text style={styles.exerciseDetailSets}>{we.sets.length} series</Text>
            </View>

            <View style={styles.setsPreview}>
              {we.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setPreviewItem}>
                  <Text style={styles.setPreviewText}>
                    {set.weight}kg × {set.reps}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Fecha y hora */}
        <View style={styles.dateContainer}>
          <MaterialIcons name="event" size={20} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{dateString}</Text>
        </View>
        <View style={styles.dateContainer}>
          <MaterialIcons name="access-time" size={20} color={COLORS.textSecondary} />
          <Text style={styles.dateText}>{timeString}</Text>
        </View>

        <View style={{ height: 100 }} />
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
    fontSize: 28,
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
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  exerciseDetail: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  exerciseDetailInfo: {
    flex: 1,
  },
  exerciseDetailName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  exerciseDetailCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  exerciseDetailSets: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: "600",
  },
  setsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  setPreviewItem: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  setPreviewText: {
    fontSize: 13,
    color: COLORS.text,
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

export default GymSummaryScreen;