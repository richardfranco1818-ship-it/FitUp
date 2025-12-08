/**
 * Pantalla principal de Cardio
 * FITUP - Exercise App
 * 
 * Permite seleccionar el tipo de entrenamiento de cardio
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
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

// Tipos - ajusta la importación según tu estructura
// import { RootStackParamList } from "../../navigation/StackNavigator";
// import { COLORS, FONT_SIZES } from "../../../types";

// Colores de la app (copia de tu types/index.ts)
const COLORS = {
  primary: "#0A2647",
  secondary: "#3585e6ff",
  background: "#f5f5f5",
  surface: "#ffffff",
  error: "#b00020",
  text: "#000000",
  textSecondary: "#777777",
};

const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
  xxlarge: 24,
};

// Color específico para Cardio
const CARDIO_COLOR = "#2196F3";

interface CardioOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconLibrary: "MaterialIcons" | "FontAwesome5";
  route: string;
  color: string;
  available: boolean;
}

// Props del componente
interface CardioScreenProps {
  navigation: any; // StackNavigationProp<RootStackParamList, "Cardio">;
  route: any;
}

const CardioScreen: React.FC<CardioScreenProps> = ({ navigation }) => {
  
  const cardioOptions: CardioOption[] = [
    {
      id: "free_run",
      title: "Carrera Libre",
      subtitle: "Corre a tu ritmo sin límites",
      icon: "directions-run",
      iconLibrary: "MaterialIcons",
      route: "FreeRun",
      color: "#4CAF50",
      available: true,
    },
    {
      id: "tempo_run",
      title: "Tempo Run",
      subtitle: "Mantén un ritmo constante",
      icon: "speed",
      iconLibrary: "MaterialIcons",
      route: "TempoRun",
      color: "#FF9800",
      available: true,
    },
    {
      id: "intervals",
      title: "Intervalos",
      subtitle: "Alterna intensidad alta y baja",
      icon: "timer",
      iconLibrary: "MaterialIcons",
      route: "Intervals",
      color: "#F44336",
      available: false, // Próximamente
    },
    {
      id: "long_run",
      title: "Carrera Larga",
      subtitle: "Entrena tu resistencia",
      icon: "running",
      iconLibrary: "FontAwesome5",
      route: "LongRun",
      color: "#9C27B0",
      available: false, // Próximamente
    },
  ];

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleSelectOption = (option: CardioOption): void => {
    if (!option.available) {
      // Mostrar mensaje de próximamente
      return;
    }
    navigation.navigate(option.route);
  };

    const handleHistory = (): void => {
    // TODO: Implementar pantalla de historial
    console.log("Historial - Próximamente");
    };

    const handleStats = (): void => {
    // TODO: Implementar pantalla de estadísticas
    console.log("Estadísticas - Próximamente");
    };

  const renderIcon = (option: CardioOption, size: number = 32) => {
    if (option.iconLibrary === "FontAwesome5") {
      return (
        <FontAwesome5
          name={option.icon as any}
          size={size}
          color={option.available ? option.color : "#BDBDBD"}
        />
      );
    }
    return (
      <MaterialIcons
        name={option.icon as any}
        size={size}
        color={option.available ? option.color : "#BDBDBD"}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cardio</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleHistory}>
          <MaterialIcons name="history" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: `${CARDIO_COLOR}20` }]}>
            <FontAwesome5 name="running" size={50} color={CARDIO_COLOR} />
          </View>
          <Text style={styles.heroTitle}>Elige tu entrenamiento</Text>
          <Text style={styles.heroSubtitle}>
            Selecciona el tipo de carrera que deseas realizar
          </Text>
        </View>

        {/* Opciones de entrenamiento */}
        <View style={styles.optionsContainer}>
          {cardioOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                !option.available && styles.optionCardDisabled,
              ]}
              onPress={() => handleSelectOption(option)}
              disabled={!option.available}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  {
                    backgroundColor: option.available
                      ? `${option.color}15`
                      : "#F5F5F5",
                  },
                ]}
              >
                {renderIcon(option, 36)}
              </View>
              
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      !option.available && styles.optionTitleDisabled,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtitle,
                      !option.available && styles.optionSubtitleDisabled,
                    ]}
                  >
                    {option.subtitle}
                  </Text>
                </View>
                
                {option.available ? (
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                ) : (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Próximamente</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acceso rápido</Text>
          
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleHistory}
            >
              <MaterialIcons name="history" size={28} color={CARDIO_COLOR} />
              <Text style={styles.quickActionText}>Historial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleStats}
            >
              <MaterialIcons name="bar-chart" size={28} color={CARDIO_COLOR} />
              <Text style={styles.quickActionText}>Estadísticas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {}}
            >
              <MaterialIcons name="emoji-events" size={28} color={CARDIO_COLOR} />
              <Text style={styles.quickActionText}>Records</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip del día */}
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={24} color="#FFC107" />
          <Text style={styles.tipText}>
            Tip: Mantén la app abierta durante tu carrera para un tracking GPS preciso.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.surface,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  optionsContainer: {
    padding: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionCardDisabled: {
    opacity: 0.7,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  optionTitleDisabled: {
    color: COLORS.textSecondary,
  },
  optionSubtitle: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  optionSubtitleDisabled: {
    color: "#BDBDBD",
  },
  comingSoonBadge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  quickActionsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    elevation: 1,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  quickActionText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginTop: 8,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: "#5D4037",
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 30,
  },
});

export default CardioScreen;