/**
 * Pantalla de Historial de Ciclismo
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
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getUserCyclingWorkouts } from "../../services/cyclingService";
import { CyclingWorkout } from "../../../types/cycling.types";
import { formatTime } from "../../utils/cardioUtils";

const COLORS = {
  primary: "#0A2647",
  background: "#f5f5f5",
  surface: "#ffffff",
  text: "#000000",
  textSecondary: "#777777",
  accent: "#FF9800",
};

interface CyclingHistoryScreenProps {
  navigation: any;
}

const CyclingHistoryScreen: React.FC<CyclingHistoryScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<CyclingWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    if (!user?.uid) return;
    
    try {
      const data = await getUserCyclingWorkouts(user.uid);
      setWorkouts(data);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts();
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTimeOfDay = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderWorkoutItem = ({ item }: { item: CyclingWorkout }) => {
    const distanceKm = (item.totalDistance / 1000).toFixed(2);
    const timeFormatted = formatTime(item.totalDuration);
    const avgSpeedKmh = ((item.averageSpeed || 0) * 3.6).toFixed(1);

    return (
      <TouchableOpacity style={styles.workoutCard} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="bicycle" size={20} color={COLORS.accent} />
            </View>
            <View>
              <Text style={styles.workoutType}>Ruta Libre</Text>
              <Text style={styles.workoutDate}>{formatDate(item.startTime)}</Text>
            </View>
          </View>
          <Text style={styles.workoutTime}>{formatTimeOfDay(item.startTime)}</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{distanceKm}</Text>
            <Text style={styles.metricLabel}>km</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{timeFormatted.formatted}</Text>
            <Text style={styles.metricLabel}>tiempo</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{avgSpeedKmh}</Text>
            <Text style={styles.metricLabel}>km/h</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.caloriesBurned || 0}</Text>
            <Text style={styles.metricLabel}>kcal</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 name="bicycle" size={60} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>Sin rutas</Text>
      <Text style={styles.emptySubtitle}>
        Aún no has registrado ninguna ruta.{"\n"}¡Comienza tu primera ruta!
      </Text>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => navigation.navigate("FreeRide")}
      >
        <MaterialIcons name="play-arrow" size={24} color="white" />
        <Text style={styles.startButtonText}>Iniciar Ruta</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <View style={styles.iconButton} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id || item.startTime.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.accent]}
            />
          }
          ListHeaderComponent={
            workouts.length > 0 ? (
              <Text style={styles.listHeader}>
                {workouts.length} {workouts.length === 1 ? 'ruta' : 'rutas'}
              </Text>
            ) : null
          }
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
    borderRadius: 20,
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  listHeader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
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
  workoutType: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  workoutDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  workoutTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E0E0E0",
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
    fontSize: 14,
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

export default CyclingHistoryScreen;