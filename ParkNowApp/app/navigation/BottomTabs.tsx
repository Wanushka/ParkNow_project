import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import ReservationListScreen from '../screens/ReservationListScreen';
import AdminScreen from '../screens/AdminScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const insets = useSafeAreaInsets();

  // ensure some minimum bottom padding on Android so the tabbar isn't
  // overlapped by system navigation (back/home/overview) buttons
  const bottomPadding = Math.max(insets.bottom || 0, Platform.OS === 'android' ? 12 : 0);
  const tabBarHeight = 64 + bottomPadding;

  const screenOptions: any = {
    headerShown: false,
    tabBarActiveTintColor: '#ffffff',
    tabBarInactiveTintColor: '#195a36ff',
    tabBarShowLabel: true,
    tabBarStyle: {
      backgroundColor: 'transparent', // gradient will show through
      borderTopWidth: 0,
      elevation: 8,
      height: tabBarHeight,
      paddingBottom: bottomPadding,
      position: 'absolute',
    },
    tabBarBackground: () => (
      <LinearGradient
        colors={['#10b981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    ),
  };

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="map" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ReservationsTab"
        component={ReservationListScreen}
        options={{
          title: 'Reservations',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="AdminTab"
        component={AdminScreen}
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="account-cog" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
