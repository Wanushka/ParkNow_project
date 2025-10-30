import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import MapScreen from './MapScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = ({ navigation }: any) => {
  const { logout } = useAuth();
  const nav: any = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            nav.replace('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerInner}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="map-search" size={28} color="#ffffff" />
              <View style={styles.headerText}>
                <Text style={styles.title}>ParkNow</Text>
                <Text style={styles.subtitle}>Find parking near you</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutText}>Logout</Text>
              <View style={styles.logoutIcon}>
                <Text style={styles.iconArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <View style={styles.content}>
        {/* reuse existing MapScreen for map and markers */}
        <MapScreen navigation={navigation} />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: {
    backgroundColor: '#ffffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    marginLeft: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 8,
  },
  logoutIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconArrow: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: { flex: 1 },
});
