import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const AppBar = ({ title, showLogout = true }: { title?: string; showLogout?: boolean }) => {
  const { logout } = useAuth();
  const navigation: any = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.container}>
          {/* App Logo/Title Section */}
          <View style={styles.titleContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <Text style={styles.title}>{title || 'ParkNow'}</Text>
          </View>

          {/* Logout Button (conditionally rendered) */}
          {showLogout ? (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Logout</Text>
              <View style={styles.logoutIcon}>
                <Text style={styles.iconText}>→</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default AppBar;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#059669',
  },
  gradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  container: {
    height: 64,
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6,
  },
  logoutIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});