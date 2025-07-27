import React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  colors,
  typography,
  spacing,
} from '../constants/theme';
import { logout, login } from '@/utils/auth';
import Logo from '../components/Logo';
import { cacheUserProfile } from '@/utils/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      await cacheUserProfile(user.id);

      if (user) {
        router.replace('/');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    logout();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="large" />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          Sign in to continue your fitness journey
        </Text>
      </View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email"
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
              placeholder="password"
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
          onPress={handleLogin}
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have account? Contact us at support@myfitwave.com</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing['4xl'],
    marginBottom: spacing['2xl'],
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerText: {
    fontSize: typography.size.md,
    color: '#9AAABD',
  },
  footerLink: {
    fontSize: typography.size.md,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
});
