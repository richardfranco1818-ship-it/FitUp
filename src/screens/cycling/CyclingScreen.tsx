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
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

type CyclingScreenNavigationProp = StackNavigationProp<RootStackParamList, "Cycling">;

interface CyclingScreenProps {
  navigation: CyclingScreenNavigationProp;
}

// Color temático para Ciclismo
const CYCLING_COLOR = "#FF9800";

const CyclingScreen: React.FC<CyclingScreenProps> = ({ navigation }) => {
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleProfile = (): void => {
    navigation.navigate("Profile");
  };

  // TODO: Implementar inicio de ruta en bicicleta
  const handleStartRide = (): void => {
    // Similar al Free Run, pero para ciclismo
    console.log("Iniciar ruta en bicicleta");
  };

  // TODO: Implementar historial de rutas
  const handleHistory = (): void => {
    console.log("Ver historial de ciclismo");
  };

  // TODO: Implementar estadísticas de ciclismo
  const handleStats = (): void => {
    console.log("Ver estadísticas de ciclismo");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ciclismo</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleProfile}>
          <MaterialIcons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Icono principal */}
        <View style={styles.iconContainer}>
          <FontAwesome5 name="bicycle" size={80} color={CYCLING_COLOR} />
        </View>

        <Text style={styles.activityTitle}>Ciclismo</Text>
        <Text style={styles.activitySubtitle}>
          Registra tus rutas y mejora tu rendimiento
        </Text>

        {/* Tarjeta informativa */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={24} color={CYCLING_COLOR} />
          <Text style={styles.infoText}>
            Rastrea tus rutas en bicicleta con GPS. Mide distancia, velocidad,
            elevación y calorías quemadas en cada sesión.
          </Text>
        </View>

        {/* Indicador de "Por Configurar" */}
        <View style={styles.comingSoonCard}>
          <MaterialIcons name="build" size={32} color={CYCLING_COLOR} />
          <Text style={styles.comingSoonText}>Módulo en desarrollo</Text>
          <Text style={styles.comingSoonSubtext}>
            Pronto podrás rastrear tus rutas en bicicleta
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtonsContainer}>
          {/* Botón principal: Iniciar Ruta */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: CYCLING_COLOR }]}
            onPress={handleStartRide}
          >
            <MaterialIcons name="play-arrow" size={24} color="white" />
            <Text style={styles.actionButtonText}>Iniciar Ruta</Text>
          </TouchableOpacity>

          {/* Botón secundario: Historial */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              { borderColor: CYCLING_COLOR },
            ]}
            onPress={handleHistory}
          >
            <MaterialIcons name="history" size={24} color={CYCLING_COLOR} />
            <Text style={[styles.actionButtonText, { color: CYCLING_COLOR }]}>
              Ver Historial
            </Text>
          </TouchableOpacity>

          {/* Botón secundario: Estadísticas */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              { borderColor: CYCLING_COLOR },
            ]}
            onPress={handleStats}
          >
            <MaterialIcons name="show-chart" size={24} color={CYCLING_COLOR} />
            <Text style={[styles.actionButtonText, { color: CYCLING_COLOR }]}>
              Estadísticas
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  activitySubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.small,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  comingSoonCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: "center",
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: CYCLING_COLOR,
  },
  comingSoonText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
  },
  comingSoonSubtext: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  actionButtonsContainer: {
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: "white",
    marginLeft: 10,
  },
});

export default CyclingScreen;