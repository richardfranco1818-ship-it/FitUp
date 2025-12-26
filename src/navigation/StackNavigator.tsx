import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Pantallas de autenticación y perfil
import LoginScreen from "../screens/auth/LoginScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Pantallas de actividades específicas
import CardioScreen from "../screens/cardio/CardioScreen";
import CyclingScreen from "../screens/cycling/CyclingScreen";
import GymScreen from "../screens/gym/GymScreen";

// Sub-pantallas de Cardio
import FreeRunScreen from "../screens/cardio/FreeRunScreen";
import WorkoutSummaryScreen from "../screens/cardio/WorkoutSummaryScreen";
import { CardioWorkout } from '../../types/cardio.types';
import CardioHistoryScreen from "../screens/cardio/CardioHistoryScreen";
// Sub-pantallas de Ciclismo
import FreeRideScreen from "../screens/cycling/FreeRideScreen";
import RideSummaryScreen from "../screens/cycling/RideSummaryScreen";
import CyclingHistoryScreen from "../screens/cycling/CyclingHistoryScreen";
import { CyclingWorkout } from "../../types/cycling.types";

// Gym 
import WorkoutScreen from "../screens/gym/WorkoutScreen";
import ExerciseListScreen from "../screens/gym/ExerciseListScreen";
import GymSummaryScreen from "../screens/gym/GymSummaryScreen";
import GymHistoryScreen from "../screens/gym/GymHistoryScreen";
import { GymWorkout } from "../../types/gym.types";


export type RootStackParamList = {
  Login: undefined;
  Register: undefined; 
  Home: undefined;
  Profile: undefined;
  // Pantallas de actividades
  Cardio: undefined;
  Cycling: undefined;
  Gym: undefined;
  // Sub-pantallas de Cardio
  FreeRun: undefined;
  WorkoutSummary: { workout: Omit<CardioWorkout, "id"> };
  CardioHistory: undefined;
  // Ciclismo
  FreeRide: undefined;
  RideSummary: { workout: Omit<CyclingWorkout, "id"> };
  CyclingHistory: undefined;

  //Gym
  WorkoutScreen: undefined;
  ExerciseList: undefined;
  GymSummary: { workout: Omit<GymWorkout, "id"> };
  GymHistory: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#25c4d6ff",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
      }}
    >

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Comenzar",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: false,
      }}
/>


      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "FitUp",
          headerLeft: () => null,
          headerShown: false,
        }}
      />


      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />


      
      <Stack.Screen
        name="Cardio"
        component={CardioScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Cycling"
        component={CyclingScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Gym"
        component={GymScreen}
        options={{
          headerShown: false,
        }}
      />

  
      
      <Stack.Screen
        name="FreeRun"
        component={FreeRunScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CardioHistory"
        component={CardioHistoryScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="FreeRide"
        component={FreeRideScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RideSummary"
        component={RideSummaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CyclingHistory"
        component={CyclingHistoryScreen}
        options={{ headerShown: false }}
      />

      
      <Stack.Screen
        name="WorkoutScreen"
        component={WorkoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExerciseList"
        component={ExerciseListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GymSummary"
        component={GymSummaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GymHistory"
        component={GymHistoryScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>

    
  );
};

export default StackNavigator;