import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Vibration,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useStopwatch } from "../../hooks/useStopwatch";
import { formatTime } from "../../utils/cardioUtils";
import { useAuth } from "../../context/AuthContext";
import {
  Exercise,
  ExerciseSet,
  WorkoutExercise,
  GymWorkout,
  EXERCISES_LIST,
  CATEGORY_NAMES,
  CATEGORY_COLORS,
  ExerciseCategory,
} from "../../../types/gym.types";

const COLORS = {
  background: "#1a1a2e",
  surface: "#16213e",
  surfaceLight: "#1f3460",
  accent: "#4CAF50",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
  danger: "#f44336",
};

interface StartGymWorkoutScreenProps {
  navigation: any;
}

const StartGymWorkoutScreen: React.FC<StartGymWorkoutScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const stopwatch = useStopwatch();
  
  // Estado del entrenamiento
  const [workoutStatus, setWorkoutStatus] = useState<"idle" | "in_progress">("idle");
  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  
  // Modales
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  
  // Ejercicio seleccionado
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  
  // Inputs para nueva serie
  const [newWeight, setNewWeight] = useState("");
  const [newReps, setNewReps] = useState("");

  // Categorías
  const categories = Object.keys(CATEGORY_NAMES) as ExerciseCategory[];

  // Calcular totales
  const totalVolume = workoutExercises.reduce((total, we) => {
    return total + we.sets.reduce((setTotal, set) => setTotal + (set.weight * set.reps), 0);
  }, 0);

  const totalSets = workoutExercises.reduce((total, we) => total + we.sets.length, 0);
  
  const totalReps = workoutExercises.reduce((total, we) => {
    return total + we.sets.reduce((setTotal, set) => setTotal + set.reps, 0);
  }, 0);

  // Iniciar entrenamiento
  const handleStart = () => {
    Vibration.vibrate(100);
    setWorkoutStatus("in_progress");
    setStartTimestamp(Date.now());
    stopwatch.start();
  };

  // Seleccionar ejercicio
  const handleSelectExercise = (exercise: Exercise) => {
    const exists = workoutExercises.find(we => we.exercise.id === exercise.id);
    if (exists) {
      Alert.alert("Ejercicio duplicado", "Este ejercicio ya está en tu entrenamiento");
      return;
    }

    const newWorkoutExercise: WorkoutExercise = {
      exercise,
      sets: [],
    };

    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
    setShowExerciseModal(false);
    Vibration.vibrate(50);
  };

  // Abrir modal para agregar serie
  const handleOpenSetModal = (exerciseIndex: number) => {
    setSelectedExerciseIndex(exerciseIndex);
    setNewWeight("");
    setNewReps("");
    setShowSetModal(true);
  };

  // Agregar serie
  const handleAddSet = () => {
    Keyboard.dismiss();
    if (selectedExerciseIndex === null) return;

    const weight = parseFloat(newWeight) || 0;
    const reps = parseInt(newReps) || 0;

    if (weight <= 0 || reps <= 0) {
      Alert.alert("Datos inválidos", "Ingresa peso y repeticiones válidos");
      return;
    }

    const updatedExercises = [...workoutExercises];
    const currentSets = updatedExercises[selectedExerciseIndex].sets;
    
    const newSet: ExerciseSet = {
      setNumber: currentSets.length + 1,
      weight,
      reps,
      completed: true,
    };

    updatedExercises[selectedExerciseIndex].sets.push(newSet);
    setWorkoutExercises(updatedExercises);
    setShowSetModal(false);
    Vibration.vibrate(50);
  };

  // Eliminar serie
  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    Alert.alert("Eliminar serie", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          const updatedExercises = [...workoutExercises];
          updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
          updatedExercises[exerciseIndex].sets.forEach((set, idx) => {
            set.setNumber = idx + 1;
          });
          setWorkoutExercises(updatedExercises);
        },
      },
    ]);
  };

  // Eliminar ejercicio
  const handleDeleteExercise = (exerciseIndex: number) => {
    Alert.alert("Eliminar ejercicio", "¿Eliminar este ejercicio y todas sus series?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          const updatedExercises = [...workoutExercises];
          updatedExercises.splice(exerciseIndex, 1);
          setWorkoutExercises(updatedExercises);
        },
      },
    ]);
  };

  // Terminar entrenamiento
  const handleFinish = () => {
    if (workoutExercises.length === 0) {
      Alert.alert("Sin ejercicios", "Agrega al menos un ejercicio");
      return;
    }
    if (totalSets === 0) {
      Alert.alert("Sin series", "Registra al menos una serie");
      return;
    }
    setShowFinishModal(true);
  };

  // Confirmar finalización
  const confirmFinish = () => {
    Vibration.vibrate([100, 50, 100]);
    stopwatch.stop();
    setShowFinishModal(false);

    const workoutData: Omit<GymWorkout, "id"> = {
      oderId: user?.uid || "",
      status: "completed",
      startTime: startTimestamp,
      endTime: Date.now(),
      totalDuration: stopwatch.time,
      exercises: workoutExercises,
      totalVolume,
      totalSets,
      totalReps,
      createdAt: Date.now(),
    };

    navigation.navigate("GymSummary", { workout: workoutData });
  };

  // Volver atrás
  const handleGoBack = () => {
    if (workoutStatus === "in_progress" && workoutExercises.length > 0) {
      Alert.alert("¿Cancelar entrenamiento?", "Perderás todo el progreso.", [
        { text: "Continuar", style: "cancel" },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => {
            stopwatch.reset();
            navigation.goBack();
          },
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const filteredExercises = selectedCategory
    ? EXERCISES_LIST.filter(e => e.category === selectedCategory)
    : EXERCISES_LIST;

  const timeFormatted = formatTime(stopwatch.time);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.background} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entrenamiento</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Timer y Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.timerBox}>
          <MaterialIcons name="timer" size={24} color={COLORS.accent} />
          <Text style={styles.timerText}>{timeFormatted.formatted}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutExercises.length}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>Series</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalVolume.toLocaleString()}</Text>
            <Text style={styles.statLabel}>kg Total</Text>
          </View>
        </View>
      </View>

      {/* Estado inicial */}
      {workoutStatus === "idle" && (
        <View style={styles.idleContainer}>
          <FontAwesome5 name="dumbbell" size={60} color={COLORS.accent} />
          <Text style={styles.idleTitle}>¿Listo para entrenar?</Text>
          <Text style={styles.idleSubtitle}>
            Presiona iniciar y comienza a registrar tus ejercicios
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <MaterialIcons name="play-arrow" size={32} color={COLORS.text} />
            <Text style={styles.startButtonText}>INICIAR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de ejercicios */}
      {workoutStatus === "in_progress" && (
        <>
          <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
            {workoutExercises.length === 0 ? (
              <View style={styles.emptyExercises}>
                <MaterialIcons name="fitness-center" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Agrega tu primer ejercicio</Text>
              </View>
            ) : (
              workoutExercises.map((workoutExercise, exerciseIndex) => (
                <View key={workoutExercise.exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[workoutExercise.exercise.category] }]} />
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{workoutExercise.exercise.name}</Text>
                      <Text style={styles.exerciseCategory}>
                        {CATEGORY_NAMES[workoutExercise.exercise.category]}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteExercise(exerciseIndex)}>
                      <MaterialIcons name="close" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>

                  {workoutExercise.sets.length > 0 && (
                    <View style={styles.setsContainer}>
                      <View style={styles.setsHeader}>
                        <Text style={styles.setsHeaderText}>Serie</Text>
                        <Text style={styles.setsHeaderText}>Peso</Text>
                        <Text style={styles.setsHeaderText}>Reps</Text>
                        <Text style={styles.setsHeaderText}></Text>
                      </View>
                      {workoutExercise.sets.map((set, setIndex) => (
                        <View key={setIndex} style={styles.setRow}>
                          <Text style={styles.setNumber}>{set.setNumber}</Text>
                          <Text style={styles.setWeight}>{set.weight} kg</Text>
                          <Text style={styles.setReps}>{set.reps}</Text>
                          <TouchableOpacity onPress={() => handleDeleteSet(exerciseIndex, setIndex)}>
                            <MaterialIcons name="delete-outline" size={18} color={COLORS.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.addSetButton}
                    onPress={() => handleOpenSetModal(exerciseIndex)}
                  >
                    <MaterialIcons name="add" size={20} color={COLORS.accent} />
                    <Text style={styles.addSetText}>Agregar Serie</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Botones flotantes */}
          <View style={styles.floatingButtons}>
            <TouchableOpacity 
              style={styles.addExerciseButton} 
              onPress={() => setShowExerciseModal(true)}
            >
              <MaterialIcons name="add" size={24} color={COLORS.text} />
              <Text style={styles.addExerciseText}>Ejercicio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <MaterialIcons name="check" size={24} color={COLORS.text} />
              <Text style={styles.finishButtonText}>Terminar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modal seleccionar ejercicio */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Ejercicio</Text>
              <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
              <TouchableOpacity
                style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {categories.filter(c => c !== 'cardio').map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && { backgroundColor: CATEGORY_COLORS[category] },
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}>
                    {CATEGORY_NAMES[category]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FlatList
              data={filteredExercises.filter(e => e.category !== 'cardio')}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseOption}
                  onPress={() => handleSelectExercise(item)}
                >
                  <View style={[styles.exerciseOptionDot, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
                  <View style={styles.exerciseOptionInfo}>
                    <Text style={styles.exerciseOptionName}>{item.name}</Text>
                    <Text style={styles.exerciseOptionCategory}>{CATEGORY_NAMES[item.category]}</Text>
                  </View>
                  <MaterialIcons name="add-circle-outline" size={24} color={COLORS.accent} />
                </TouchableOpacity>
              )}
              style={styles.exerciseOptionsList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal agregar serie */}
      <Modal
        visible={showSetModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSetModal(false)}
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>   
        <View style={styles.modalOverlay}>
          <View style={styles.setModalContainer}>
            <Text style={styles.setModalTitle}>Nueva Serie</Text>
            {selectedExerciseIndex !== null && (
              <Text style={styles.setModalSubtitle}>
                {workoutExercises[selectedExerciseIndex]?.exercise.name}
              </Text>
            )}

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={newWeight}
                  onChangeText={setNewWeight}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Repeticiones</Text>
                <TextInput
                  style={styles.input}
                  value={newReps}
                  onChangeText={setNewReps}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={styles.setModalButtons}>
              <TouchableOpacity style={styles.setModalCancel} onPress={() => setShowSetModal(false)}>
                <Text style={styles.setModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.setModalConfirm} onPress={handleAddSet}>
                <Text style={styles.setModalConfirmText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </TouchableWithoutFeedback> 
      </Modal>

      {/* Modal confirmar terminar */}
      <Modal
        visible={showFinishModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFinishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.finishModalContainer}>
            <FontAwesome5 name="dumbbell" size={48} color={COLORS.accent} />
            <Text style={styles.finishModalTitle}>¿Terminar entrenamiento?</Text>
            <Text style={styles.finishModalStats}>
              {workoutExercises.length} ejercicios • {totalSets} series • {totalVolume.toLocaleString()} kg
            </Text>

            <View style={styles.finishModalButtons}>
              <TouchableOpacity style={styles.finishModalCancel} onPress={() => setShowFinishModal(false)}>
                <Text style={styles.finishModalCancelText}>Continuar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.finishModalConfirm} onPress={confirmFinish}>
                <Text style={styles.finishModalConfirmText}>Terminar</Text>
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
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timerText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 12,
    fontVariant: ["tabular-nums"],
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: 8,
  },
  idleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  idleTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 24,
  },
  idleSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 8,
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyExercises: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  exerciseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  exerciseCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  setsContainer: {
    marginTop: 16,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: 12,
  },
  setsHeader: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  setsHeaderText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  setNumber: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },
  setWeight: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
    fontWeight: "600",
  },
  setReps: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    borderStyle: "dashed",
  },
  addSetText: {
    fontSize: 14,
    color: COLORS.accent,
    marginLeft: 8,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  addExerciseButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8,
  },
  finishButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: COLORS.text,
    fontWeight: "600",
  },
  exerciseOptionsList: {
    paddingHorizontal: 16,
  },
  exerciseOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  exerciseOptionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  exerciseOptionInfo: {
    flex: 1,
  },
  exerciseOptionName: {
    fontSize: 16,
    color: COLORS.text,
  },
  exerciseOptionCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  setModalContainer: {
    backgroundColor: COLORS.surface,
    margin: 20,
    borderRadius: 20,
    padding: 24,
  },
  setModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  setModalSubtitle: {
    fontSize: 14,
    color: COLORS.accent,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
  setModalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  setModalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
  },
  setModalCancelText: {
    fontSize: 16,
    color: COLORS.text,
  },
  setModalConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: "center",
  },
  setModalConfirmText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  finishModalContainer: {
    backgroundColor: COLORS.surface,
    margin: 20,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  finishModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 16,
  },
  finishModalStats: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  finishModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  finishModalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
  },
  finishModalCancelText: {
    fontSize: 16,
    color: COLORS.text,
  },
  finishModalConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: "center",
  },
  finishModalConfirmText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
});

export default StartGymWorkoutScreen;