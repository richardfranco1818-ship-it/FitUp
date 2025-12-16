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

const COLORS = {
  primary: "#0A2647",
  background: "#f5f5f5",
  surface: "#ffffff",
  text: "#000000",
  textSecondary: "#777777",
};

const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
};

const CYCLING_COLOR = "#FF9800";

interface CyclingScreenProps {
  navigation: any;
}

const CyclingScreen: React.FC<CyclingScreenProps> = ({ navigation }) => {

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleStartFreeRide = (): void => {
    navigation.navigate("FreeRide");
  };

  const handleHistory = (): void => {
    navigation.navigate("CyclingHistory");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ciclismo</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleHistory}>
          <MaterialIcons name="history" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
 
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: `${CYCLING_COLOR}20` }]}>
            <FontAwesome5 name="bicycle" size={50} color={CYCLING_COLOR} />
          </View>
          <Text style={styles.heroTitle}>¡A pedalear!</Text>
          <Text style={styles.heroSubtitle}>
            Rastrea tu ruta con GPS en tiempo real
          </Text>
        </View>

      
        <View style={styles.mainCardContainer}>
          <TouchableOpacity
            style={styles.mainCard}
            onPress={handleStartFreeRide}
            activeOpacity={0.8}
          >
            <View style={styles.mainCardIcon}>
              <FontAwesome5 name="route" size={40} color={CYCLING_COLOR} />
            </View>
            
            <View style={styles.mainCardContent}>
              <Text style={styles.mainCardTitle}>Ruta Libre</Text>
              <Text style={styles.mainCardSubtitle}>
                Pedalea a tu ritmo sin límites
              </Text>
            </View>

            <View style={styles.mainCardArrow}>
              <MaterialIcons name="play-circle-filled" size={48} color={CYCLING_COLOR} />
            </View>
          </TouchableOpacity>
        </View>

  
        <View style={styles.historyContainer}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleHistory}
            activeOpacity={0.8}
          >
            <MaterialIcons name="history" size={28} color={CYCLING_COLOR} />
            <Text style={styles.historyButtonText}>Ver Historial de Rutas</Text>
            <MaterialIcons name="chevron-right" size={24} color={CYCLING_COLOR} />
          </TouchableOpacity>
        </View>

  
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb-outline" size={24} color="#FFC107" />
          <Text style={styles.tipText}>
            Tip: Mantén la app abierta durante tu ruta para un tracking GPS preciso.
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
  mainCardContainer: {
    padding: 16,
  },
  mainCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: CYCLING_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: CYCLING_COLOR,
  },
  mainCardIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${CYCLING_COLOR}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mainCardContent: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  mainCardSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  mainCardArrow: {
    marginLeft: 8,
  },
  historyContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.medium,
    fontWeight: "500",
    color: COLORS.text,
    marginLeft: 12,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
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

export default CyclingScreen;