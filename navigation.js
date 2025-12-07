// navigation.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/auth/LoginScreen";
import HomeScreen from "./src/screens/home/HomeScreen";
import AlumnoScreen from "./src/screens/Alumnos/AlumnoScreen";
import AlumnoDetailScreen from "./src/screens/Alumnos/AlumnoDetailScreen";
import ProfesorScreen from "./src/screens/Profesores/ProfesorScreen";
import GrupoScreen from "./src/screens/Grupos/GrupoScreen";
import GrupoDetailScreen from "./src/screens/Grupos/GrupoDetailScreen";
import MateriaScreen from "./src/screens/Materias/MateriaScreen";
const Stack = createStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Iniciar Sesión" }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Menú" }}
      />
      <Stack.Screen
        name="AlumnoList"
        component={AlumnoScreen}
        options={{ title: "Lista de Alumnos" }}
      />
      <Stack.Screen
        name="AlumnoDetails"
        component={AlumnoDetailScreen}
        options={{ title: "Detalle de alumno" }}
      />
      <Stack.Screen
        name="ProfesorList"
        component={ProfesorScreen}
        options={{ title: "Lista de Profesores" }}
      />
      <Stack.Screen
        name="MateriaList"
        component={MateriaScreen}
        options={{ title: "Lista de Materias" }}
      />
      <Stack.Screen
        name="GrupoList"
        component={GrupoScreen}
        options={{ title: "Lista de Grupos" }}
      />
      <Stack.Screen
        name="GrupoDetails"
        component={GrupoDetailScreen}
        options={{ title: "Detalle de alumno" }}
      />
    </Stack.Navigator>
  );
};
export default StackNavigator;
