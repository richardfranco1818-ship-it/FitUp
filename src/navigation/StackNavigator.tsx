import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ActivityScreen from "../screens/activity/ActivityScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import CardioScreen from "../screens/cardio/CardioScreen";
import FreeRunScreen from "../screens/cardio/FreeRunScreen";
import WorkoutSummaryScreen from "../screens/cardio/WorkoutSummaryScreen";
import { CardioWorkout } from '../../types/cardio.types';


export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Cardio: undefined;  
  Activity: {
    activityName: string;
    activityIcon: string;
    activityIconLibrary: "FontAwesome5" | "MaterialIcons" | "Entypo";
    activityColor: string;
  };
  Profile: undefined;
  FreeRun: undefined;
  WorkoutSummary: { workout: Omit<CardioWorkout, "id"> };
};


const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Cardio" component={CardioScreen} />
      <Stack.Screen name="FreeRun" component={FreeRunScreen} />
      <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;