import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthLayout from '../../components/AuthLayout';
import { Button, InputField } from '../../components/UI';
import { Radius, useTheme } from '../../constants/theme';
import { authApi } from '../../services/api';
import { getApiError } from '../../utils/authHelpers';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'> };

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [devCode, setDevCode] = useState('');

  async function handleSendCode() {
    if (!email.trim()) return Alert.alert('Email required', 'Enter the email linked to your account.');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      const data = res.data?.data as { message?: string; devCode?: string };
      setSent(true);
      if (data?.devCode) setDevCode(data.devCode);
      Alert.alert(
        'Check your email',
        data?.devCode
          ? `Dev mode: your reset code is ${data.devCode}`
          : (data?.message || 'If that email is registered, a reset code was sent.')
      );
    } catch (error) {
      Alert.alert('Error', getApiError(error, 'Could not send reset code.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send a 6-digit reset code."
      footer={
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backRow}>
          <Text style={[styles.backText, { color: colors.brand }]}>← Back to sign in</Text>
        </TouchableOpacity>
      }
    >
      {sent && (
        <View style={[styles.infoBox, { backgroundColor: colors.brandDim, borderColor: colors.brandBdr }]}>
          <Text style={[styles.infoText, { color: colors.brand }]}>
            Reset code sent to {email.trim()}
            {devCode ? `\n\nDev code: ${devCode}` : ''}
          </Text>
        </View>
      )}

      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
        editable={!sent}
      />

      {!sent ? (
        <Button label="Send Reset Code" onPress={handleSendCode} loading={loading} style={{ marginTop: 8 }} />
      ) : (
        <Button
          label="Enter Reset Code →"
          onPress={() => navigation.navigate('ResetPassword', { email: email.trim() })}
          style={{ marginTop: 8 }}
        />
      )}
    </AuthLayout>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    infoBox: { borderRadius: Radius.md, borderWidth: 1, padding: 14, marginBottom: 16 },
    infoText: { fontSize: 13, fontWeight: '600', lineHeight: 20 },
    backRow: { alignItems: 'center', marginTop: 24 },
    backText: { fontSize: 14, fontWeight: '600' },
  });
