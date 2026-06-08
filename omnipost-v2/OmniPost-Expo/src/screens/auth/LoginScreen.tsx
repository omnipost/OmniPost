import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AuthLayout from '../../components/AuthLayout';
import { Button, InputField } from '../../components/UI';
import { Spacing, useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';
import { parseAuthResponse, getApiError } from '../../utils/authHelpers';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { setAuth } = useAuthStore();

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      const { user, accessToken } = parseAuthResponse(res);
      setAuth(user, accessToken);
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: `Signed in as ${user.name}` });
    } catch (error) {
      setError(getApiError(error, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your social posts from one place."
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSec }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.footerLink, { color: colors.brand }]}>Create account</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />

      <View style={styles.passRow}>
        <View style={{ flex: 1 }}>
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            placeholder="Enter your password"
          />
        </View>
        <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotRow}
      >
        <Text style={[styles.forgotText, { color: colors.brand }]}>Forgot password?</Text>
      </TouchableOpacity>

      <Button label="Sign In" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
    </AuthLayout>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    passRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
    eyeBtn: { padding: 12, marginBottom: 14 },
    eyeIcon: { fontSize: 18 },
    errorText: { marginBottom: 10, fontSize: 13, fontWeight: '600' },
    forgotRow: { alignItems: 'flex-end', marginBottom: 4, marginTop: -4 },
    forgotText: { fontSize: 13, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { fontSize: 14 },
    footerLink: { fontSize: 14, fontWeight: '700' },
  });
