import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AuthLayout from '../../components/AuthLayout';
import { Button, InputField } from '../../components/UI';
import { useTheme } from '../../constants/theme';
import { authApi } from '../../services/api';
import { getApiError } from '../../utils/authHelpers';
import type { RootStackParamList } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
  route: RouteProp<RootStackParamList, 'ResetPassword'>;
};

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail]       = useState(route.params.email);
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleReset() {
    if (!email.trim() || !code.trim() || !password) {
      return Alert.alert('Missing fields', 'Fill in all fields to reset your password.');
    }
    if (password.length < 8) {
      return Alert.alert('Weak password', 'Password must be at least 8 characters.');
    }
    if (password !== confirm) {
      return Alert.alert('Mismatch', 'Passwords do not match.');
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email.trim(), code.trim(), password);
      Toast.show({ type: 'success', text1: 'Password updated', text2: 'You can now sign in.' });
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Reset failed', getApiError(error, 'Invalid or expired reset code.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter the 6-digit code from your email and choose a new password."
      footer={
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.backRow}>
          <Text style={[styles.backText, { color: colors.brand }]}>← Resend code</Text>
        </TouchableOpacity>
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
      <InputField
        label="Reset code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        placeholder="6-digit code"
        maxLength={6}
        style={{ textAlign: 'center', letterSpacing: 6, fontSize: 20 }}
      />
      <InputField
        label="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Min. 8 characters"
      />
      <InputField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Re-enter password"
      />
      <Button label="Update Password" onPress={handleReset} loading={loading} style={{ marginTop: 8 }} />
    </AuthLayout>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    backRow: { alignItems: 'center', marginTop: 24 },
    backText: { fontSize: 14, fontWeight: '600' },
  });
