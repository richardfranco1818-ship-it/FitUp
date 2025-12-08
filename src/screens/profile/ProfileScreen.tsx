import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Linking,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";
import { useAuth } from "../../context/AuthContext";
import { actualizarPerfil } from "../../services/authService";
import * as ImagePicker from "expo-image-picker";

type ProfileScreenNavigationProp = StackNavigationProp< 
  RootStackParamList,
  "Profile"
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

interface ActividadOption {
  id: string;
  nombre: string;
  icon: string;
  iconLibrary: "MaterialIcons" | "FontAwesome5";
  color: string;
}

const actividadesDisponibles: ActividadOption[] = [
  { id: "cardio", nombre: "Cardio", icon: "running", iconLibrary: "FontAwesome5", color: "#2196F3" },
  { id: "pesas", nombre: "Pesas", icon: "dumbbell", iconLibrary: "FontAwesome5", color: "#2c842c" },
  { id: "yoga", nombre: "Yoga", icon: "spa", iconLibrary: "MaterialIcons", color: "#9C27B0" },
  { id: "crossfit", nombre: "CrossFit", icon: "fitness-center", iconLibrary: "MaterialIcons", color: "#FF5722" },
  { id: "natacion", nombre: "Natación", icon: "swimmer", iconLibrary: "FontAwesome5", color: "#00BCD4" },
  { id: "ciclismo", nombre: "Ciclismo", icon: "bicycle", iconLibrary: "FontAwesome5", color: "#FF9800" },
];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, profile, setProfile } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  
  // Estados locales para edición
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [peso, setPeso] = useState<string>("");
  const [altura, setAltura] = useState<string>("");
  const [edad, setEdad] = useState<string>("");
  const [actividadFavorita, setActividadFavorita] = useState<string>("");
  const [fotoPerfil, setFotoPerfil] = useState<string>("");

  // Cargar datos del perfil cuando esté disponible
  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || "");
      setEmail(profile.email || "");
      setPeso(profile.peso || "");
      setAltura(profile.altura || "");
      setEdad(profile.edad || "");
      setActividadFavorita(profile.actividadFavorita || "");
      setFotoPerfil(profile.fotoPerfil || "");
    }
  }, [profile]);

  // Solicitar permisos
// Solicitar permisos
const solicitarPermisos = async (): Promise<boolean> => {
  // Verificar permisos de cámara
  const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
  let cameraStatus = cameraPermission.status;
  
  if (cameraStatus !== "granted") {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    cameraStatus = status;
  }

  // Verificar permisos de galería
  const mediaPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
  let mediaStatus = mediaPermission.status;
  
  if (mediaStatus !== "granted") {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    mediaStatus = status;
  }

  // Si los permisos fueron denegados permanentemente
  if (cameraStatus === "denied" || mediaStatus === "denied") {
    Alert.alert(
      "Permisos necesarios",
      "Para cambiar tu foto de perfil, necesitas habilitar los permisos en la configuración de tu dispositivo.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Abrir Configuración", onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  }

  return cameraStatus === "granted" && mediaStatus === "granted";
};

  // Tomar foto con cámara
  const tomarFoto = async () => {
  setModalVisible(false);
  
  const tienePermisos = await solicitarPermisos();
  if (!tienePermisos) return;

  const resultado = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],  // ← Cambio aquí
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!resultado.canceled && resultado.assets[0]) {
    guardarFoto(resultado.assets[0].uri);
  }
};

  // Seleccionar de galería
const seleccionarDeGaleria = async () => {
  setModalVisible(false);
  
  const tienePermisos = await solicitarPermisos();
  if (!tienePermisos) return;

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],  // ← Cambio aquí
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!resultado.canceled && resultado.assets[0]) {
    guardarFoto(resultado.assets[0].uri);
  }
};

  // Guardar foto en el perfil
  const guardarFoto = async (uri: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await actualizarPerfil(user.uid, { fotoPerfil: uri });
      setFotoPerfil(uri);
      
      if (profile) {
        setProfile({ ...profile, fotoPerfil: uri });
      }
      
      Alert.alert("Éxito", "Foto de perfil actualizada");
    } catch (error: any) {
      Alert.alert("Error", "No se pudo actualizar la foto");
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar foto
  const eliminarFoto = async () => {
    setModalVisible(false);
    
    if (!user) return;

    Alert.alert(
      "Eliminar foto",
      "¿Estás seguro de que quieres eliminar tu foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await actualizarPerfil(user.uid, { fotoPerfil: "" });
              setFotoPerfil("");
              
              if (profile) {
                setProfile({ ...profile, fotoPerfil: "" });
              }
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la foto");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleEdit = (): void => {
    setIsEditing(true);
  };

  const handleSave = async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      const datosActualizados = {
        nombre,
        peso,
        altura,
        edad,
        actividadFavorita,
      };

      await actualizarPerfil(user.uid, datosActualizados);
      
      if (profile) {
        setProfile({ ...profile, ...datosActualizados });
      }

      setIsEditing(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    if (profile) {
      setNombre(profile.nombre || "");
      setPeso(profile.peso || "");
      setAltura(profile.altura || "");
      setEdad(profile.edad || "");
      setActividadFavorita(profile.actividadFavorita || "");
    }
    setIsEditing(false);
  };

  const getActividadInfo = (id: string): ActividadOption | undefined => {
    return actividadesDisponibles.find((a) => a.id === id);
  };

  const renderActividadIcon = (actividad: ActividadOption, size: number = 24, color?: string) => {
    const iconColor = color || actividad.color;

    if (actividad.iconLibrary === "FontAwesome5") {
      return <FontAwesome5 name={actividad.icon as any} size={size} color={iconColor} />;
    }
    return <MaterialIcons name={actividad.icon as any} size={size} color={iconColor} />;
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const actividadActual = getActividadInfo(actividadFavorita);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        {isEditing ? (
          <TouchableOpacity style={styles.iconButton} onPress={handleCancel}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
            <MaterialIcons name="edit" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal para opciones de foto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cambiar foto de perfil</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={tomarFoto}>
              <MaterialIcons name="camera-alt" size={24} color={COLORS.primary} />
              <Text style={styles.modalOptionText}>Tomar foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={seleccionarDeGaleria}>
              <MaterialIcons name="photo-library" size={24} color={COLORS.primary} />
              <Text style={styles.modalOptionText}>Seleccionar de galería</Text>
            </TouchableOpacity>
            
            {fotoPerfil ? (
              <TouchableOpacity style={styles.modalOption} onPress={eliminarFoto}>
                <MaterialIcons name="delete" size={24} color={COLORS.error} />
                <Text style={[styles.modalOptionText, { color: COLORS.error }]}>
                  Eliminar foto
                </Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.contentContainer}>
        {/* Avatar y datos principales */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)} disabled={isLoading}>
            <View style={styles.avatarWrapper}>
              {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <MaterialIcons name="person" size={80} color={COLORS.primary} />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <MaterialIcons name="camera-alt" size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{nombre}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          <Text style={styles.tapToChange}>Toca la foto para cambiarla</Text>
        </View>

        {/* Actividad Favorita */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Favorita</Text>
          
          {isEditing ? (
            <View style={styles.actividadesGrid}>
              {actividadesDisponibles.map((actividad) => (
                <TouchableOpacity
                  key={actividad.id}
                  style={[
                    styles.actividadOption,
                    actividadFavorita === actividad.id && styles.actividadSelected,
                  ]}
                  onPress={() => setActividadFavorita(actividad.id)}
                >
                  {renderActividadIcon(
                    actividad,
                    24,
                    actividadFavorita === actividad.id ? "#FFFFFF" : actividad.color
                  )}
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
          ) : (
            <View style={styles.actividadDisplay}>
              {actividadActual && (
                <>
                  {renderActividadIcon(actividadActual, 40)}
                  <Text style={[styles.actividadDisplayText, { color: actividadActual.color }]}>
                    {actividadActual.nombre}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="person-outline" size={24} color={COLORS.primary} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={nombre}
                onChangeText={setNombre}
                editable={isEditing}
                placeholder="Tu nombre"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color={COLORS.primary} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={email}
                editable={false}
                placeholder="tu@email.com"
              />
            </View>
          </View>
        </View>

        {/* Datos Físicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Físicos</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="monitor-weight" size={24} color={COLORS.primary} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Peso (kg)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={peso}
                onChangeText={setPeso}
                editable={isEditing}
                placeholder="70"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="height" size={24} color={COLORS.primary} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Altura (cm)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={altura}
                onChangeText={setAltura}
                editable={isEditing}
                placeholder="170"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="cake" size={24} color={COLORS.primary} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Edad</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={edad}
                onChangeText={setEdad}
                editable={isEditing}
                placeholder="25"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="fitness-center" size={32} color={COLORS.primary} />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Entrenamientos</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="local-fire-department" size={32} color="#FF5722" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Calorías</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="timer" size={32} color="#2196F3" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Horas</Text>
            </View>
          </View>
        </View>

        {/* Botón Guardar */}
        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <MaterialIcons name="save" size={24} color="white" />
            <Text style={styles.saveButtonText}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
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
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.surface,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  userName: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 15,
  },
  userEmail: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  tapToChange: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.surface,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  inputWrapper: {
    flex: 1,
    marginLeft: 15,
  },
  inputLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  input: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    padding: 0,
  },
  inputDisabled: {
    color: COLORS.text,
  },
  actividadesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actividadOption: {
    width: "30%",
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#D0D0D0",
  },
  actividadSelected: {
    backgroundColor: COLORS.primary,
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
  actividadDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 12,
  },
  actividadDisplayText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    marginLeft: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: FONT_SIZES.medium,
    fontWeight: "bold",
    marginLeft: 10,
  },
  bottomSpacing: {
    height: 30,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginLeft: 15,
  },
  modalCancelButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});

export default ProfileScreen;