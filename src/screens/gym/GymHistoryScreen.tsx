import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { formatTime } from "../../utils/cardioUtils";
import { GymWorkout, CATEGORY_COLORS } from "../../../types/gym.types";
import { getUserGymWorkouts, deleteGymWorkout } from "../../services/gymService";
import { useAuth } from "../../context/AuthContext";

const COLORS = {
  primary: "#0A2647",
  background: "#f5f5f5",
  surface: "#ffffff",
  text: "#000000",
  textSecondary: "#777777",
  accent: "#4CAF50",
};

interface GymHistoryScreenProps {
  navigation: any;
}

const GymHistoryScreen: React.FC<GymHistoryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<GymWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWorkouts = async () => {
    if (!user?.uid) return;

    try {
      const data = await getUserGymWorkouts(user.uid);
      setWorkouts(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [user?.uid])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWorkouts();
  };

  const handleDelete = (workoutId: string) => {
    Alert.alert(
      "Eliminar entrenamiento",
      "¿Estás seguro de eliminar este entrenamiento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGymWorkout(workoutId);
              setWorkouts(workouts.filter((w) => w.id !== workoutId));
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el entrenamiento");
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTimeOfDay = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderWorkoutItem = ({ item }: { item: GymWorkout }) => {
    const timeFormatted = formatTime(item.totalDuration);
    
    const categoryColors = [...new Set(
      item.exercises.map(e => CATEGORY_COLORS[e.exercise.category])
    )];

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onLongPress={() => item.id && handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="dumbbell" size={18} color={COLORS.accent} />
            </View>
            <View>
              <Text style={styles.workoutTitle}>Entrenamiento</Text>
              <Text style={styles.workoutDate}>
                {formatDate(item.startTime)} • {formatTimeOfDay(item.startTime)}
              </Text>
            </View>
          </View>
          
          <View style={styles.categoryIndicators}>
            {categoryColors.slice(0, 4).map((color, index) => (
              <View
                key={index}
                style={[styles.categoryIndicator, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.exercises.length}</Text>
            <Text style={styles.metricLabel}>Ejercicios</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.totalSets}</Text>
            <Text style={styles.metricLabel}>Series</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.totalVolume.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>kg</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{timeFormatted.minutes}:{String(timeFormatted.seconds).padStart(2, '0')}</Text>
            <Text style={styles.metricLabel}>Tiempo</Text>
          </View>
        </View>

        <View style={styles.exercisesPreview}>
          <Text style={styles.exercisesPreviewText} numberOfLines={1}>
            {item.exercises.map(e => e.exercise.name).join(" • ")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="dumbbell" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Sin entrenamientos</Text>
      <Text style={styles.emptySubtitle}>
        Aún no has registrado ningún entrenamiento de gym
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate("StartGymWorkout")}
      >
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.startButtonText}>Iniciar Entrenamiento</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Gym</Text>
        <View style={styles.iconButton} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id || item.startTime.toString()}
          renderItem={renderWorkoutItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.accent]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  iconButton: {
    padding: 8,
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  workoutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.accent}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  workoutDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryIndicators: {
    flexDirection: "row",
    gap: 4,
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E0E0E0",
  },
  exercisesPreview: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
  },
  exercisesPreviewText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default GymHistoryScreen;