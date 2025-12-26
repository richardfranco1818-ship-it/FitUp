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
import  SyncStatusBar  from '../../components/SyncStatusBar';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface MenuOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconLibrary: "FontAwesome5" | "MaterialIcons";
  color: string;
  bgColor: string;
  route: keyof RootStackParamList;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Agregar al inicio del contenido */}
      <SyncStatusBar />
      
      {/* Resto de tu contenido */}
    </SafeAreaView>
      );
  };
  const menuOptions: MenuOption[] = [
    {
      id: "cardio",
      title: "Running",
      subtitle: "Rastrea tus carreras con GPS",
      icon: "running",
      iconLibrary: "FontAwesome5",
      color: "#FFFFFF",
      bgColor: "#2196F3",
      route: "Cardio",
    },
    {
      id: "gym",
      title: "Gym",
      subtitle: "Entrena tu fuerza",
      icon: "dumbbell",
      iconLibrary: "FontAwesome5",
      color: "#FFFFFF",
      bgColor: "#4CAF50",
      route: "Gym",
    },
    {
      id: "ciclismo",
      title: "Ciclismo",
      subtitle: "Registra tus rutas",
      icon: "bicycle",
      iconLibrary: "FontAwesome5",
      color: "#FFFFFF",
      bgColor: "#FF9800",
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

  const renderIcon = (option: MenuOption, size: number = 50) => {
    const iconProps = {
      size: size,
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


      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
          <MaterialIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FitUp</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleProfile}>
          <MaterialIcons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

    
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
   
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>¡Hola! 👋</Text>
          <Text style={styles.greetingSubtext}>¿Qué vas a entrenar hoy?</Text>
        </View>

      
        <View style={styles.activitiesContainer}>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.activityCard, { backgroundColor: option.bgColor }]}
              onPress={() => handleNavigation(option)}
              activeOpacity={0.85}
            >
          
              <View style={styles.activityIconCircle}>
                {renderIcon(option, 55)}
              </View>
              
             
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>{option.title}</Text>
                <Text style={styles.activitySubtitle}>{option.subtitle}</Text>
              </View>

           
              <View style={styles.activityArrow}>
                <MaterialIcons name="arrow-forward-ios" size={24} color="rgba(255,255,255,0.8)" />
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
    fontSize: 24,
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
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  // Saludo
  greetingContainer: {
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
  },
  greetingSubtext: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  // Tarjetas de actividades 
  activitiesContainer: {
    gap: 20,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,
    minHeight: 130,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  activityIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  activitySubtitle: {
    fontSize: FONT_SIZES.medium,
    color: "rgba(255,255,255,0.9)",
  },
  activityArrow: {
    marginLeft: 10,
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