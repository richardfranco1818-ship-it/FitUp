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
import { MaterialIcons, FontAwesome5, Entypo } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

type ActivityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Activity"
>;
type ActivityScreenRouteProp = RouteProp<RootStackParamList, "Activity">;

interface ActivityScreenProps {
  navigation: ActivityScreenNavigationProp;
  route: ActivityScreenRouteProp;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({
  navigation,
  route,
}) => {
 const {
  activityName = "Actividad",
  activityIcon = "fitness-center",
  activityIconLibrary = "MaterialIcons",
  activityColor = "#2196F3",
} = route.params || {};

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleProfile = (): void => {
    navigation.navigate("Profile");
  };

  const renderIcon = () => {
    const iconProps = {
      size: 80,
      color: activityColor,
    };
    switch (activityIconLibrary) {
      case "FontAwesome5":
        return <FontAwesome5 name={activityIcon as any} {...iconProps} />;
      case "MaterialIcons":
        return <MaterialIcons name={activityIcon as any} {...iconProps} />;
      case "Entypo":
        return <Entypo name={activityIcon as any} {...iconProps} />;
      default:
        return <MaterialIcons name="fitness-center" {...iconProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activityName}</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleProfile}>
          <MaterialIcons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>

        <Text style={styles.activityTitle}>{activityName}</Text>
        <Text style={styles.activitySubtitle}>
          Entrena y mejora tu condición física
        </Text>

        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={24} color={activityColor} />
          <Text style={styles.infoText}>
            Aquí podrás registrar tus entrenamientos de {activityName.toLowerCase()},
            seguir tu progreso y alcanzar tus metas fitness.
          </Text>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: activityColor }]}
          >
            <MaterialIcons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>
              Iniciar Entrenamiento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              { borderColor: activityColor },
            ]}
          >
            <MaterialIcons
              name="history"
              size={24}
              color={activityColor}
            />
            <Text
              style={[styles.actionButtonText, { color: activityColor }]}
            >
              Ver Historial
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              { borderColor: activityColor },
            ]}
          >
            <MaterialIcons
              name="show-chart"
              size={24}
              color={activityColor}
            />
            <Text
              style={[styles.actionButtonText, { color: activityColor }]}
            >
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    marginBottom: 30,
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

export default ActivityScreen;