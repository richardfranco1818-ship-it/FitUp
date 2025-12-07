import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/auth/LoginScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ActivityScreen from "../screens/activity/ActivityScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Activity: {
    activityName: string;
    activityIcon: string;
    activityIconLibrary: "FontAwesome5" | "MaterialIcons" | "Entypo";
    activityColor: string;
  };
  Profile: undefined;
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
        name="Home"
        component={HomeScreen}
        options={{
          title: "FitUp",
          headerLeft: () => null,
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
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
    </Stack.Navigator>
  );
};

export default StackNavigator;