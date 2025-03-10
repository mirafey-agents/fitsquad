import { useState } from 'react';
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
  borderRadius,
  shadows,
} from './constants/theme';
import { supabase, login, logout } from './utils/supabase';
import Logo from './components/Logo';

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
      const data = await login(email, password);

      if (data?.user) {
        router.replace('/');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  logout();

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
            placeholder="demotrainer@fitsquad.club"
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
              placeholder="demotrainer"
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
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing['4xl'],
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.lg,
    color: colors.gray[500],
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: colors.primary.dark,
    borderWidth: 1,
    borderColor: colors.gray[200],
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
    backgroundColor: colors.primary.dark,
    borderRadius: borderRadius.lg,
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
    color: colors.primary.light,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
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
    color: colors.gray[500],
  },
  footerLink: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
});
