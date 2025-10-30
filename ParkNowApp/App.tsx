// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./src/context/AuthContext";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from "./app/screens/Auth/LoginScreen";
import SignupScreen from "./app/screens/Auth/SignupScreen";
import SplashScreen from "./app/screens/SplashScreen";
import MapScreen from "./app/screens/MapScreen";
import SpotDetailScreen from "./app/screens/SpotDetailScreen";
import ReservationListScreen from "./app/screens/ReservationListScreen";
import AdminScreen from "./app/screens/AdminScreen";
import BottomTabs from './app/navigation/BottomTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="Home" component={BottomTabs} />
          <Stack.Screen name="SpotDetail" component={SpotDetailScreen} />
          <Stack.Screen name="Reservations" component={ReservationListScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
        </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
