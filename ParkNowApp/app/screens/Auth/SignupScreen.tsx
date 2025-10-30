import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { signup } from "../../../src/api/api";

const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    // client-side validation
    const validateEmail = (value: string) => {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      return re.test(String(value).toLowerCase());
    };

    let ok = true;
    if (!name) {
      setNameError('Full name is required');
      ok = false;
    } else {
      setNameError(null);
    }

    if (!email) {
      setEmailError('Email is required');
      ok = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      ok = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Password is required');
      ok = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      ok = false;
    } else {
      setPasswordError(null);
    }

    if (!role) {
      setRoleError('Please select a role');
      ok = false;
    } else {
      setRoleError(null);
    }

    if (!ok) {
      setLoading(false);
      return;
    }

    try {
  await signup({ name, email, password, role: role! });
      Alert.alert("Signup Successful");
      navigation.navigate("Login");
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Signup failed. Please try again.';
      Alert.alert("Signup Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#10b981', '#059669', '#047857']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join ParkNow today</Text>
          </View>

          {/* Signup Card */}
          <View style={styles.card}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={(v) => { setName(v); if (nameError) setNameError(null); }}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(null); }}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="Create a password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={(v) => { setPassword(v); if (passwordError) setPasswordError(null); }}
                style={styles.input}
                autoCapitalize="none"
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

              {/* Role Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select Role</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    onPress={() => { setRole("user"); if (roleError) setRoleError(null); }}
                    style={[
                      styles.roleButton,
                      role === "user" && styles.roleButtonSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        role === "user" ? styles.roleTextSelected : styles.roleText
                      }
                    >
                      User
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => { setRole("admin"); if (roleError) setRoleError(null); }}
                    style={[
                      styles.roleButton,
                      role === "admin" && styles.roleButtonSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={
                        role === "admin" ? styles.roleTextSelected : styles.roleText
                      }
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
                {roleError ? <Text style={styles.errorText}>{roleError}</Text> : null}
              </View>

            {/* Signup Button */}
            <TouchableOpacity
              onPress={handleSignup}
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.signupButtonText}>
                  {loading ? "Creating Account..." : "Sign Up"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <TouchableOpacity 
              onPress={() => navigation.navigate("Login")}
              style={styles.loginButton}
              activeOpacity={0.7}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    color: '#dc2626',
    marginTop: 6,
    fontSize: 13,
  },
  signupButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 15,
    color: '#6b7280',
  },
  loginTextBold: {
    fontWeight: '700',
    color: '#10b981',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    marginRight: 10,
  },
  roleButtonSelected: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  roleText: {
    color: '#374151',
    fontWeight: '600',
  },
  roleTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
});