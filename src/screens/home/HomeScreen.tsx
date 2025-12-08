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
} from "react-native";
import { MaterialIcons, FontAwesome5, Entypo } from "@expo/vector-icons";
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
  iconLibrary: "FontAwesome5" | "MaterialIcons" | "Entypo";
  color: string;
  route?: keyof RootStackParamList;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const menuOptions: MenuOption[] = [
    {
      id: "cardio",
      title: "Cardio",
      icon: "running",
      iconLibrary: "FontAwesome5",
      color: "#2196F3",
      route: "Activity",
    },
    {
      id: "pesas",
      title: "Pesas",
      icon: "dumbbell",
      iconLibrary: "FontAwesome5",
      color: "#2c842cff",
      route: "Activity",
    },
    {
      id: "yoga",
      title: "Yoga",
      icon: "spa",
      iconLibrary: "MaterialIcons",
      color: "#9C27B0",
      route: "Activity",
    },
    {
      id: "crossfit",
      title: "CrossFit",
      icon: "fitness-center",
      iconLibrary: "MaterialIcons",
      color: "#FF5722",
      route: "Activity",
    },
    {
      id: "natacion",
      title: "Natación",
      icon: "swimmer",
      iconLibrary: "FontAwesome5",
      color: "#00BCD4",
      route: "Activity",
    },
    {
      id: "ciclismo",
      title: "Ciclismo",
      icon: "bicycle",
      iconLibrary: "FontAwesome5",
      color: "#FF9800",
      route: "Activity",
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
  // Esta parte se usa para que podamos verificar la opcion elegida por el usuario 
  if (option.id === "cardio") {
    navigation.navigate("Cardio");
    return;
  }
 
  // DESPUÉS el resto - todos van a Activity con parámetros
  navigation.navigate("Activity", {
    activityName: option.title,
    activityIcon: option.icon,
    activityIconLibrary: option.iconLibrary,
    activityColor: option.color,
  });
};

  const renderIcon = (option: MenuOption) => {
    const iconProps = {
      size: 50,
      color: option.color,
    };
    switch (option.iconLibrary) {
      case "FontAwesome5":
        return <FontAwesome5 name={option.icon as any} {...iconProps} />;
      case "MaterialIcons":
        return <MaterialIcons name={option.icon as any} {...iconProps} />;
      case "Entypo":
        return <Entypo name={option.icon as any} {...iconProps} />;
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
        <Text style={styles.headerTitle}>Inicio</Text>
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

      <View style={styles.contentContainer}>
        <Text style={styles.instructionText}>Cuida tu salud</Text>
        <View style={styles.gridContainer}>
          {menuOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.card}
              onPress={() => handleNavigation(option)}
              activeOpacity={0.7}
            >
              {renderIcon(option)}
              <Text style={styles.cardText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    paddingTop: 20,
  },
  instructionText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  card: {
    width: "42%",
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.text,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cardText: {
    marginTop: 12,
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
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