import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminCreateSpot, setAuthToken } from "../../src/api/api";
import { useAuth } from "../../src/context/AuthContext";

const AdminScreen = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets(); // ensure content sits above device nav bar / home indicator
  const { token } = useAuth();

  const handleAddSpot = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a title");
      return;
    }
    if (!desc.trim()) {
      Alert.alert("Validation Error", "Please enter a description");
      return;
    }
    if (!lat.trim() || isNaN(parseFloat(lat))) {
      Alert.alert("Validation Error", "Please enter a valid latitude");
      return;
    }
    if (!lng.trim() || isNaN(parseFloat(lng))) {
      Alert.alert("Validation Error", "Please enter a valid longitude");
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid price");
      return;
    }

    // Require token (server enforces admin role)
    if (!token) {
      Alert.alert("Authentication required", "Please sign in as an admin to add spots.");
      return;
    }

    // Ensure axios has the Authorization header
    setAuthToken(token);

    setLoading(true);
    try {
      const res = await adminCreateSpot({
        title,
        description: desc,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        price_per_hour: parseFloat(price),
      });

      // check for expected success (201)
      if (res.status === 201 || res.status === 200) {
        Alert.alert(
          "Success!",
          "Parking spot has been added successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                // Clear form
                setTitle("");
                setDesc("");
                setLat("");
                setLng("");
                setPrice("");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", `Unexpected response: ${res.status}`);
      }
    } catch (err: any) {
      // Better error messages for common auth failures
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err.message || "Failed to add parking spot";
      if (status === 401) {
        Alert.alert("Unauthorized", "You must be signed in to perform this action.");
      } else if (status === 403) {
        Alert.alert("Forbidden", "Admin privileges required to add parking spots.");
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="shield-crown" size={32} color="#ffffff" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Admin Panel</Text>
              <Text style={styles.headerSubtitle}>Add New Parking Spot</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            // ensure there's enough bottom padding so the add button isn't obscured by nav bar
            { paddingBottom: Math.max(40, insets.bottom + 24) }
          ]}
        >
          {/* Main Card */}
          <View style={styles.card}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
              <MaterialCommunityIcons name="information" size={20} color="#10b981" />
              <Text style={styles.infoText}>
                Fill in all details to create a new parking spot
              </Text>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MaterialCommunityIcons name="tag" size={20} color="#10b981" />
                <Text style={styles.labelText}>Spot Title</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="e.g., Downtown Parking A1"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <MaterialCommunityIcons name="text" size={20} color="#10b981" />
                <Text style={styles.labelText}>Description</Text>
              </View>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  placeholder="Describe the parking spot location and features"
                  value={desc}
                  onChangeText={setDesc}
                  style={[styles.input, styles.textArea]}
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Location Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="map-marker" size={22} color="#10b981" />
                <Text style={styles.sectionTitle}>Location Coordinates</Text>
              </View>

              {/* Latitude Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <MaterialCommunityIcons name="latitude" size={18} color="#6b7280" />
                  <Text style={styles.labelText}>Latitude</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="e.g., 7.2088"
                    value={lat}
                    onChangeText={setLat}
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Longitude Input */}
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <MaterialCommunityIcons name="longitude" size={18} color="#6b7280" />
                  <Text style={styles.labelText}>Longitude</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="e.g., 79.8340"
                    value={lng}
                    onChangeText={setLng}
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="cash" size={22} color="#10b981" />
                <Text style={styles.sectionTitle}>Pricing</Text>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <MaterialCommunityIcons name="currency-usd" size={18} color="#6b7280" />
                  <Text style={styles.labelText}>Price per Hour (Rs.)</Text>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencyPrefix}>Rs.</Text>
                  <TextInput
                    placeholder="0.00"
                    value={price}
                    onChangeText={setPrice}
                    style={[styles.input, styles.priceInput]}
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.priceSuffix}>/hour</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleAddSpot}
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
              // small extra margin so the button doesn't hug the scroll content edge
              { marginBottom: Math.max(8, insets.bottom ? 8 : 20) }
            ]}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10b981', '#0e5941ff']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons 
                name={loading ? "loading" : "plus-circle"} 
                size={24} 
                color="#ffffff" 
              />
              <Text style={styles.submitButtonText}>
                {loading ? "Adding Spot..." : "Add Parking Spot"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdminScreen;

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
    paddingBottom: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
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
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    paddingVertical: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginRight: 8,
  },
  priceInput: {
    fontSize: 18,
    fontWeight: '600',
  },
  priceSuffix: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  section: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});