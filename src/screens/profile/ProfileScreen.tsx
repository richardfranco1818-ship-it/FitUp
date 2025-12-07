import React, { useState } from "react";
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES } from "../../../types";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>("Usuario");
  const [email, setEmail] = useState<string>("usuario@ejemplo.com");
  const [weight, setWeight] = useState<string>("70");
  const [height, setHeight] = useState<string>("170");
  const [age, setAge] = useState<string>("25");

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const handleEdit = (): void => {
    setIsEditing(!isEditing);
  };

  const handleSave = (): void => {
    setIsEditing(false);
    Alert.alert("Éxito", "Perfil actualizado correctamente", [{ text: "OK" }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconButton} onPress={handleGoBack}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={isEditing ? handleSave : handleEdit}
        >
          <MaterialIcons
            name={isEditing ? "save" : "edit"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={80} color={COLORS.primary} />
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <MaterialIcons name="camera-alt" size={20} color="white" />
              <Text style={styles.changePhotoText}>Cambiar Foto</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="person-outline" size={24} color={COLORS.primary} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={name}
                onChangeText={setName}
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
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                editable={isEditing}
                placeholder="tu@email.com"
                keyboardType="email-address"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Físicos</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="monitor-weight" size={24} color={COLORS.primary} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Peso (kg)</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={weight}
                onChangeText={setWeight}
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
                value={height}
                onChangeText={setHeight}
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
                value={age}
                onChangeText={setAge}
                editable={isEditing}
                placeholder="25"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="fitness-center" size={32} color={COLORS.primary} />
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Entrenamientos</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="local-fire-department" size={32} color="#FF5722" />
              <Text style={styles.statNumber}>2,450</Text>
              <Text style={styles.statLabel}>Calorías</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="timer" size={32} color="#2196F3" />
              <Text style={styles.statNumber}>12.5</Text>
              <Text style={styles.statLabel}>Horas</Text>
            </View>
          </View>
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
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.surface,
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
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  changePhotoText: {
    color: "white",
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    padding: 20,
    marginBottom: 10,
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
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 1,
    shadowColor: COLORS.text,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
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
});

export default ProfileScreen;