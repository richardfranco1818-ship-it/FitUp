import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ActivityScreen from "../screens/activity/ActivityScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
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
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;