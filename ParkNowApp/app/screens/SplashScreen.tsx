import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator, Animated, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../src/context/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = () => {
  const navigation: any = useNavigation();
  const { token, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide the native status bar while the splash is visible to avoid
    // showing the Expo/OS bar or any logo at the top. Restore it when leaving.
    StatusBar.setHidden(true, 'fade');

    // Wait until auth restoration finishes, then route.
    if (!isLoading) {
      const t = setTimeout(() => {
        // If we have a token restored, go straight to Home; otherwise go to Login
        if (token) navigation.replace("Home");
        else navigation.replace("Login");
      }, 1200); // short branded pause

      return () => {
        clearTimeout(t);
        // restore status bar
        StatusBar.setHidden(false, 'fade');
      };
    }
  }, [isLoading, token, navigation]);

  return (
    <LinearGradient
      colors={['#10b981', '#059669', '#047857']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo container with shadow */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App name with modern typography */}
        <Text style={styles.title}>ParkNow</Text>
        <Text style={styles.subtitle}>Find your spot, park with ease</Text>

        {/* Modern loading indicator */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Animated.View>

      {/* Version text at bottom */}
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -100,
    right: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -50,
    left: -50,
  },
  circle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: '50%',
    left: -75,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    marginTop: 20,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});

export default SplashScreen;