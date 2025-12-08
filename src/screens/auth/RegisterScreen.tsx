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
import { RootStackParamList } from "../../navigation/StackNavigator";
import { registrarUsuario } from "../../services/authService";
import { COLORS, FONT_SIZES } from "../../../types";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

interface ActividadOption {
  id: string;
  nombre: string;
  icon: string;
  iconLibrary: "MaterialIcons" | "FontAwesome5";
}

const actividadesDisponibles: ActividadOption[] = [
  { id: "cardio", nombre: "Cardio", icon: "running", iconLibrary: "FontAwesome5" },
  { id: "pesas", nombre: "Pesas", icon: "dumbbell", iconLibrary: "FontAwesome5" },
  { id: "yoga", nombre: "Yoga", icon: "spa", iconLibrary: "MaterialIcons" },
  { id: "crossfit", nombre: "CrossFit", icon: "fitness-center", iconLibrary: "MaterialIcons" },
  { id: "natacion", nombre: "Natación", icon: "swimmer", iconLibrary: "FontAwesome5" },
  { id: "ciclismo", nombre: "Ciclismo", icon: "bicycle", iconLibrary: "FontAwesome5" },
];

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [edad, setEdad] = useState("");
  const [actividadFavorita, setActividadFavorita] = useState<string>("");
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
    if (!peso.trim() || !altura.trim() || !edad.trim()) {
      Alert.alert("Error", "Por favor, completa tus datos físicos");
      return false;
    }
    if (!actividadFavorita) {
      Alert.alert("Error", "Por favor, selecciona tu actividad favorita");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await registrarUsuario(email, password, nombre, peso, altura, edad, actividadFavorita);
      Alert.alert("¡Éxito!", "Cuenta creada correctamente", [
        { text: "OK", onPress: () => navigation.replace("Home") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActividadIcon = (actividad: ActividadOption, isSelected: boolean) => {
    const color = isSelected ? "#FFFFFF" : "#666";
    const size = 24;

    if (actividad.iconLibrary === "FontAwesome5") {
      return <FontAwesome5 name={actividad.icon as any} size={size} color={color} />;
    }
    return <MaterialIcons name={actividad.icon as any} size={size} color={color} />;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.appName}>FITUP</Text>
            <Text style={styles.appSubtitle}>Crear cuenta</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>REGISTRO</Text>
            <Text style={styles.welcomeSubtitle}>
              Completa tus datos para comenzar
            </Text>

            <View style={styles.formContainer}>
              {/* Datos de cuenta */}
              <Text style={styles.sectionTitle}>Datos de cuenta</Text>
              
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                placeholderTextColor="#999"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                editable={!isLoading}
              />

              <Text style={styles.label}>Correo electrónico</Text>
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

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />

              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
              />

              {/* Datos físicos */}
              <Text style={styles.sectionTitle}>Datos físicos</Text>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Peso (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="70"
                    placeholderTextColor="#999"
                    value={peso}
                    onChangeText={setPeso}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Altura (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="170"
                    placeholderTextColor="#999"
                    value={altura}
                    onChangeText={setAltura}
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <Text style={styles.label}>Edad</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor="#999"
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
                editable={!isLoading}
              />

              {/* Actividad favorita */}
              <Text style={styles.sectionTitle}>Actividad favorita</Text>
              <Text style={styles.sublabel}>Selecciona tu deporte preferido</Text>

              <View style={styles.actividadesGrid}>
                {actividadesDisponibles.map((actividad) => (
                  <TouchableOpacity
                    key={actividad.id}
                    style={[
                      styles.actividadOption,
                      actividadFavorita === actividad.id && styles.actividadSelected,
                    ]}
                    onPress={() => setActividadFavorita(actividad.id)}
                    disabled={isLoading}
                  >
                    {renderActividadIcon(actividad, actividadFavorita === actividad.id)}
                    <Text
                      style={[
                        styles.actividadText,
                        actividadFavorita === actividad.id && styles.actividadTextSelected,
                      ]}
                    >
                      {actividad.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? "CREANDO CUENTA..." : "REGISTRARME"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate("Login")}
                disabled={isLoading}
              >
                <Text style={styles.loginLinkText}>
                  ¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Inicia sesión</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A2647",
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#F5C563",
    paddingBottom: 5,
  },
  label: {
    fontSize: 14,
    color: "#2C2C2C",
    marginBottom: 8,
    fontWeight: "500",
  },
  sublabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
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
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  actividadesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actividadOption: {
    width: "30%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#D0D0D0",
  },
  actividadSelected: {
    backgroundColor: "#0A2647",
    borderColor: "#F5C563",
  },
  actividadText: {
    fontSize: 11,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  actividadTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
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