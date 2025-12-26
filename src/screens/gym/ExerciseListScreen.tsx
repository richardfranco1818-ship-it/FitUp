import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Exercise,
  EXERCISES_LIST,
  CATEGORY_NAMES,
  CATEGORY_COLORS,
  ExerciseCategory,
} from "../../../types/gym.types";

const COLORS = {
  primary: "#0A2647",
  background: "#f5f5f5",
  surface: "#ffffff",
  text: "#000000",
  textSecondary: "#777777",
  accent: "#4CAF50",
};

interface ExerciseListScreenProps {
  navigation: any;
}

const ExerciseListScreen: React.FC<ExerciseListScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);

  const categories = Object.keys(CATEGORY_NAMES).filter(c => c !== 'cardio') as ExerciseCategory[];

  const filteredExercises = selectedCategory
    ? EXERCISES_LIST.filter(e => e.category === selectedCategory)
    : EXERCISES_LIST.filter(e => e.category !== 'cardio');

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseItem}>
      <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseCategory}>{CATEGORY_NAMES[item.category]}</Text>
      </View>
      <MaterialIcons name="fitness-center" size={20} color={COLORS.textSecondary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lista de Ejercicios</Text>
        <View style={styles.iconButton} />
      </View>

      {/* Filtros de categoría */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedCategory && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.filterChipText,
              !selectedCategory && styles.filterChipTextActive,
            ]}>
              Todos ({EXERCISES_LIST.filter(e => e.category !== 'cardio').length})
            </Text>
          </TouchableOpacity>

          {categories.map(category => {
            const count = EXERCISES_LIST.filter(e => e.category === category).length;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && { backgroundColor: CATEGORY_COLORS[category] },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive,
                ]}>
                  {CATEGORY_NAMES[category]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lista de ejercicios */}
      <FlatList
        data={filteredExercises}
        keyExtractor={item => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.listHeader}>
            {filteredExercises.length} ejercicios disponibles
          </Text>
        }
      />
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
  filterContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E8E8E8",
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    fontWeight: "600",
    color: COLORS.text,
  },
  exerciseCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default ExerciseListScreen;