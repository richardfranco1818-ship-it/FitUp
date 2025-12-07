import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { LoginFormData, FONT_SIZES } from "../../../types/index";

// Imagen del logo
const loginImage = require("../../../assets/PESA.png");

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateFormData = (field: keyof LoginFormData, value: string): void => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      Alert.alert("Error", "Por favor, ingrese su usuario");
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert("Error", "Por favor, ingrese su contraseña");
      return false;
    }
    if (formData.password.length < 4) {
      Alert.alert("Error", "La contraseña debe tener al menos 4 caracteres");
      return false;
    }
    return true;
  };

  const handleLogin = (): void => {
    if (!validateForm()) {
      return;
    }
    authenticateUser();
  };

  const authenticateUser = (): void => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Usuario autenticado:", formData.username);
      navigation.replace("Home");
    }, 2000);
  };

  const handleForgotPassword = (): void => {
    Alert.alert(
      "Recuperar Contraseña",
      "Esta funcionalidad estará disponible próximamente.",
      [{ text: "Entendido" }]
    );
  };

  const handleGoogleSignIn = (): void => {
    Alert.alert(
      "Registrarme",
      "Esta funcionalidad estará disponible próximamente.",
      [{ text: "Entendido" }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView>

      
        {/* Header con logo */}
        <View style={styles.header}>
          <Image source={loginImage} style={styles.logo} />
          <Text style={styles.appName}>FITUP</Text>
          <Text style={styles.appSubtitle}>Exercise app</Text>
        </View>

        {/* Card de login */}
        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>BIENVENIDO</Text>
          <Text style={styles.welcomeSubtitle}>¿Listo para entrenar?</Text>

          {/* Formulario */}
          <View style={styles.formContainer}>
            {/* Email */}
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#999"
              value={formData.username}
              onChangeText={(text) => updateFormData("username", text)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(text) => updateFormData("password", text)}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            {/* Remember me y Forgot password */}
            <View style={styles.optionsRow}>
              
              <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                <Text style={styles.forgotPassword}>Olvide mi contraseña</Text>
              </TouchableOpacity>
            </View>

            {/* Botón Comenzar */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "CARGANDO..." : "COMENZAR"}
              </Text>
            </TouchableOpacity>

            {/* Botón Google Sign In */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.googleButtonText}>Registrarme</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A2647",
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingTop: 90
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F5C563",
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#F5C563",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#E8E8E8",
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C2C2C",
    textAlign: "center",
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 25,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#2C2C2C",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 15,
    color: "#2C2C2C",
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#666",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#F5C563",
    borderColor: "#F5C563",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  rememberMeText: {
    fontSize: 13,
    color: "#2C2C2C",
  },
  forgotPassword: {
    fontSize: 13,
    color: "#2C2C2C",
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#F5C563",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#3B4A6B",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  googleButtonText: {
    color: "#2C2C2C",
    fontSize: 15,
    fontWeight: "500",
  },
});

export default LoginScreen;