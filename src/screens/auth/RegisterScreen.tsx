import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/StackNavigator";
import { registrarUsuario } from "../../services/authService";
import { MaterialIcons } from "@expo/vector-icons";

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!nombre.trim()) {
      Alert.alert("Error", "Por favor, ingresa tu nombre");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Por favor, ingresa tu correo");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Por favor, ingresa una contraseña");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Se pasan valores vacíos para los campos eliminados
      await registrarUsuario(email, password, nombre, "", "", "", "");
      Alert.alert("¡Éxito!", "Cuenta creada correctamente", [
        { text: "OK", onPress: () => navigation.replace("Home") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>FITUP</Text>
            <Text style={styles.appSubtitle}>Crea tu cuenta</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>REGISTRO</Text>
            <Text style={styles.welcomeSubtitle}>
              Solo necesitamos lo esencial para comenzar
            </Text>

            <View style={styles.formContainer}>

              {/* Nombre */}
              <Text style={styles.label}>Nombre completo</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre completo"
                  placeholderTextColor="#999"
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              {/* Correo */}
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Contraseña */}
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirmar Contraseña */}
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialIcons
                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              {/* Indicador de seguridad de contraseña */}
              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={[
                    styles.strengthBar,
                    { backgroundColor: password.length < 6 ? "#FF5722" : password.length < 10 ? "#FF9800" : "#4CAF50" }
                  ]} />
                  <Text style={styles.strengthText}>
                    {password.length < 6 ? "Contraseña débil" : password.length < 10 ? "Contraseña media" : "Contraseña fuerte"}
                  </Text>
                </View>
              )}

              {/* Botón registrar */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? "CREANDO CUENTA..." : "REGISTRARME"}
                </Text>
              </TouchableOpacity>

              {/* Link a login */}
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
                disabled={isLoading}
              >
                <Text style={styles.loginLinkText}>
                  ¿Ya tienes cuenta?{" "}
                  <Text style={styles.loginLinkBold}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
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
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 40,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#2C2C2C",
  },
  passwordStrength: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: -5,
  },
  strengthBar: {
    height: 4,
    width: 60,
    borderRadius: 2,
    marginRight: 8,
  },
  strengthText: {
    fontSize: 12,
    color: "#666",
  },
  registerButton: {
    backgroundColor: "#F5C563",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#3B4A6B",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 10,
  },
  loginLinkText: {
    fontSize: 14,
    color: "#666",
  },
  loginLinkBold: {
    fontWeight: "bold",
    color: "#0A2647",
  },
});

export default RegisterScreen;