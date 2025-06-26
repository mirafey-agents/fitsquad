import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, Pressable, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '@/utils/firebase';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LoginV2() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is signed in:', user.email);
        // Keep user on this page as requested
        // You can add logic here to show user info or redirect later
      } else {
        console.log('User is signed out');
      }
    });

    return unsubscribe;
  }, []);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in user:', userCredential.user.email);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/logo_with_text_1024.svg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          Sign in to continue
        </Text>
      </View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.gray[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <Pressable
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={colors.gray[400]}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.loginButtonText}>Signing in...</Text>
          ) : (
            <>
              <Text style={styles.loginButtonText}>Sign In</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.primary.light}
              />
            </>
          )}
        </Pressable>

        <View style={styles.invitationContainer}>
          <Ionicons name="mail" size={20} color={colors.semantic.warning} />
          <Text style={styles.invitationText}>
            New user? Email support@myfitwave.com to request access
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginTop: spacing['4xl'],
    marginBottom: spacing['2xl'],
  },
  logo: {
    width: 450,
    height: 200,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size['3xl'],
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.lg,
    color: '#9AAABD',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#21262F',
    borderRadius: 24,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: 'bold',
    color: '#9AAABD',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: '#3C4148',
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#21262F',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing['4xl'],
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 24,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  invitationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.semantic.warning + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.semantic.warning + '40',
    gap: spacing.sm,
  },
  invitationText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 