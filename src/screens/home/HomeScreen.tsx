import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface MenuOption {
  id: string;
  title: string;
  icon: string;
  iconLibrary: "FontAwesome5" | "MaterialIcons";
  color: string;
  route: keyof RootStackParamList;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  // Datos de ejemplo para el progreso (puedes conectar con Firebase después)
  const progressData = {
    percentage: 56,
    currentActivity: "Ciclismo",
  };

  // Solo 3 actividades: Running, Gym y Ciclismo
  const menuOptions: MenuOption[] = [
    {
      id: "cardio",
      title: "Running",
      icon: "running",
      iconLibrary: "FontAwesome5",
      color: "#2196F3",
      route: "Cardio",
    },
    {
      id: "gym",
      title: "Gym",
      icon: "dumbbell",
      iconLibrary: "FontAwesome5",
      color: "#4CAF50",
      route: "Gym",
    },
    {
      id: "ciclismo",
      title: "Ciclismo",
      icon: "bicycle",
      iconLibrary: "FontAwesome5",
      color: "#FF9800",
      route: "Cycling",
    },
  ];

  const handleLogout = (): void => {
    setMenuVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  const handleProfile = (): void => {
    setMenuVisible(false);
    navigation.navigate("Profile");
  };

  const openMenu = (): void => {
    setMenuVisible(true);
  };

  const closeMenu = (): void => {
    setMenuVisible(false);
  };

  const handleNavigation = (option: MenuOption): void => {
    navigation.navigate(option.route as any);
  };

  const renderIcon = (option: MenuOption) => {
    const iconProps = {
      size: 28,
      color: option.color,
    };
    switch (option.iconLibrary) {
      case "FontAwesome5":
        return <FontAwesome5 name={option.icon as any} {...iconProps} />;
      case "MaterialIcons":
        return <MaterialIcons name={option.icon as any} {...iconProps} />;
      default:
        return <MaterialIcons name="help-outline" {...iconProps} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
          <MaterialIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FitUp</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleProfile}>
          <MaterialIcons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal del menú */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={closeMenu}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menú de Usuario</Text>
            <Pressable style={styles.menuOption} onPress={handleProfile}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>Mi Perfil</Text>
            </Pressable>
            <Pressable style={styles.menuOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>
                Cerrar Sesión
              </Text>
            </Pressable>
            <Pressable style={styles.closeMenuButton} onPress={closeMenu}>
              <Text style={styles.closeMenuText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de Progreso */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Avance de{"\n"}actividad:</Text>
            <View style={styles.progressValueContainer}>
              <Text style={styles.progressValue}>{progressData.percentage}%</Text>
              <TouchableOpacity style={styles.progressButton}>
                <MaterialIcons name="add" size={16} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.currentActivity}>{progressData.currentActivity}</Text>
        </View>

        {/* Botones de Actividades */}
        <View style={styles.activitiesContainer}>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.activityButton}
              onPress={() => handleNavigation(option)}
              activeOpacity={0.7}
            >
              <View style={styles.activityContent}>
                <View style={styles.iconWrapper}>
                  {renderIcon(option)}
                </View>
                <Text style={styles.activityText}>{option.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Tarjeta de progreso
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 10,
  },
  progressLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: "500",
    lineHeight: 22,
  },
  progressValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressValue: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
  },
  progressButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.text,
    justifyContent: "center",
    alignItems: "center",
  },
  currentActivity: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  // Botones de actividades
  activitiesContainer: {
    gap: 16,
  },
  activityButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    alignItems: "center",
  },
  activityText: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "500",
    color: COLORS.text,
  },
  // Modal menu
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  menuTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginLeft: 15,
    fontWeight: "500",
  },
  closeMenuButton: {
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeMenuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});

export default HomeScreen;