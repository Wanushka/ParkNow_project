import React from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
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

  const profileItems = [
    {
      icon: 'account',
      label: 'Full Name',
      value: user?.name ?? '—',
      color: '#10b981',
    },
    {
      icon: 'email',
      label: 'Email Address',
      value: user?.email ?? '—',
      color: '#3b82f6',
    },
    ...(user?.phone ? [{
      icon: 'phone',
      label: 'Phone Number',
      value: user.phone,
      color: '#8b5cf6',
    }] : []),
  ];


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#ffffff', '#f0fdf4']}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="account" size={48} color="#10b981" />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email ?? 'email@example.com'}</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Account Information Card */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-circle" size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>Account Information</Text>
            </View>

            <View style={styles.card}>
              {profileItems.map((item, index) => (
                <View key={index}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoLabel}>
                      <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
                        <MaterialCommunityIcons 
                          name={item.icon as any} 
                          size={20} 
                          color={item.color} 
                        />
                      </View>
                      <Text style={styles.labelText}>{item.label}</Text>
                    </View>
                    <Text style={styles.valueText}>{item.value}</Text>
                  </View>
                  {index < profileItems.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions removed */}

          {/* Account Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="cog" size={24} color="#10b981" />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>

            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => Alert.alert('Settings', 'Edit profile coming soon!')}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#3b82f615' }]}>
                    <MaterialCommunityIcons name="pencil" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.settingText}>Edit Profile</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => Alert.alert('Settings', 'Notifications settings coming soon!')}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#f59e0b15' }]}>
                    <MaterialCommunityIcons name="bell" size={20} color="#f59e0b" />
                  </View>
                  <Text style={styles.settingText}>Notifications</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => Alert.alert('Settings', 'Privacy settings coming soon!')}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#8b5cf615' }]}>
                    <MaterialCommunityIcons name="shield-lock" size={20} color="#8b5cf6" />
                  </View>
                  <Text style={styles.settingText}>Privacy & Security</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.logoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#ffffff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}></Text>
              </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerText: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    paddingVertical: 14,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 52,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  logoutButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 8,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 4,
  },
});