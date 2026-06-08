// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Radius, Typography, useTheme } from '../../constants/theme';
import { Button, InputField } from '../../components/UI';
import { CountryCodePicker } from '../../components/CountryCodePicker';
import { CountryOption, COUNTRIES } from '../../constants/countries';
import { useAuthStore } from '../../store/authStore';
import { DEMO_CREDENTIALS } from '../../constants/platforms';
import { authApi } from '../../services/api';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };
type LoginMethod = 'email' | 'mobile';

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [method, setMethod]     = useState<LoginMethod>('email');
  const [email, setEmail]       = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [country, setCountry]   = useState<CountryOption>(COUNTRIES.find(c => c.iso2 === 'IN') ?? COUNTRIES[0]);
  const [mobile, setMobile]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [otpSent, setOtpSent]   = useState(false);
  const [otp, setOtp]           = useState('');
  const { setAuth }             = useAuthStore();

  async function handleLogin() {
    if (method === 'email') {
      if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
      setLoading(true);
      try {
        if (email.trim().toLowerCase() === 'demo@omnipost.in' && password === 'Demo@123') {
          const mockUser = {
            id: 'demo-user-id',
            name: 'Demo Creator',
            email: 'demo@omnipost.in',
            plan: 'creator' as const,
            isVerified: true,
            createdAt: new Date().toISOString(),
          };
          setAuth(mockUser, 'mock-access-token');
          try {
            navigation.replace('Main');
          } catch (e) {}
          return;
        }

        Alert.alert(
          'Login Failed',
          'Incorrect email or password. Please use email: demo@omnipost.in and password: Demo@123'
        );
      } catch (error: any) {
        const message = error?.response?.data?.error || 'Login failed. Please try again.';
        Alert.alert('Login Failed', message);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleSendOtp() {
    if (!mobile) return Alert.alert('Error', 'Please enter your mobile number');
    setLoading(true);
    try {
      setOtpSent(true);
      Alert.alert('OTP Sent', `OTP sent to ${country.dialCode} ${mobile}. Use demo OTP: ${DEMO_CREDENTIALS.otp}`);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to send OTP';
      Alert.alert('OTP Error', message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otp) return Alert.alert('Error', 'Please enter the OTP');
    setLoading(true);
    try {
      if (otp.trim() === DEMO_CREDENTIALS.otp) {
        const mockUser = {
          id: 'demo-user-id',
          name: 'Demo Creator',
          email: 'demo@omnipost.in',
          mobile: `${country.dialCode}${mobile}`,
          plan: 'creator' as const,
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        setAuth(mockUser, 'mock-access-token');
        try {
          navigation.replace('Main');
        } catch (e) {}
        return;
      }
      Alert.alert('OTP Error', 'Invalid OTP. Hint: Use 123456');
    } catch (error: any) {
      const message = error?.response?.data?.error || 'OTP verification failed';
      Alert.alert('OTP Error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoRow}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>OmniPost</Text>
        </View>

        <Text style={styles.h1}>Welcome back 👋</Text>
        <Text style={styles.sub}>Sign in to your creator dashboard</Text>

        {/* Demo Banner */}
        <View style={styles.demoBanner}>
          <Text style={styles.demoTitle}>🔑 Demo Credentials</Text>
          <Text style={styles.demoText}>Email: <Text style={styles.demoCode}>{DEMO_CREDENTIALS.email}</Text></Text>
          <Text style={styles.demoText}>Password: <Text style={styles.demoCode}>{DEMO_CREDENTIALS.password}</Text></Text>
        </View>

        {/* Method Toggle */}
        <View style={styles.methodRow}>
          {(['email', 'mobile'] as const).map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setMethod(m)}
              style={[styles.methodBtn, method === m && styles.methodBtnActive]}
            >
              <Text style={[styles.methodText, method === m && styles.methodTextActive]}>
                {m === 'email' ? '📧 Email' : '📱 Mobile OTP'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        {method === 'email' ? (
          <>
            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
            <View style={{ marginBottom: 14 }}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.passRow}>
                <InputField
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  placeholder="••••••••"
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
            <Button label="Sign In →" onPress={handleLogin} loading={loading} />
          </>
        ) : (
          <>
            <View style={styles.mobileRow}>
              <CountryCodePicker value={country} onSelect={setCountry} />
              <InputField
                containerStyle={{ flex: 1 }}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                placeholder="1234567890"
                style={{ marginBottom: 0, textAlign: 'center' }}
                label=""
              />
            </View>
            {otpSent && (
              <InputField
                label="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholder="6-digit OTP"
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20 }}
              />
            )}
            <Button
              label={otpSent ? 'Verify OTP →' : 'Send OTP →'}
              onPress={otpSent ? handleVerifyOtp : handleSendOtp}
              loading={loading}
            />
            {otpSent && (
              <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.resendRow}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Divider */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>

        {/* Google Login */}
        <Button
          label="Continue with Google"
          onPress={() => Alert.alert('Coming soon', 'Google login is not yet available in this app.')}
          variant="secondary"
        />

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Start free trial</Text>
          </TouchableOpacity>
        </View>

        {/* Platform icons */}
        <View style={styles.platformRow}>
          {['IG','X','YT','FB','LI','Th','SC','TG'].map((p, i) => (
            <View key={p} style={[styles.platformDot, { backgroundColor: ['#E1306C','#1DA1F2','#FF0000','#1877F2','#0A66C2','#AAAAAA','#F58020','#2AABEE'][i] + '33' }]}>
              <Text style={{ fontSize: 8, fontWeight: '800', color: ['#E1306C','#1DA1F2','#FF0000','#1877F2','#0A66C2','#AAAAAA','#F58020','#2AABEE'][i] }}>{p}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.platformLabel}>Publish to 12+ platforms simultaneously</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: typeof Colors) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg0 },
  scroll: { padding: Spacing.xl, paddingTop: 56 },

  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoImage:{ width: 38, height: 38, borderRadius: 11 },
  logoText: { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },

  h1:  { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: 14, color: colors.textSec, marginBottom: 22 },

  demoBanner: { backgroundColor: colors.brandDim, borderRadius: 12, borderWidth: 1, borderColor: colors.brandBdr, padding: 14, marginBottom: 20 },
  demoTitle:  { fontSize: 13, fontWeight: '700', color: colors.brand, marginBottom: 6 },
  demoText:   { fontSize: 12, color: colors.textSec, marginBottom: 2 },
  demoCode:   { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: colors.text },

  methodRow:        { flexDirection: 'row', backgroundColor: colors.bg2, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 4, marginBottom: 18, gap: 4 },
  methodBtn:        { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  methodBtnActive:  { backgroundColor: colors.brand },
  methodText:       { fontSize: 13, fontWeight: '600', color: colors.textSec },
  methodTextActive: { color: colors.white },

  fieldLabel: { fontSize: 11, fontWeight: '700', color: colors.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  passRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:     { padding: 10 },
  eyeIcon:    { fontSize: 18 },
  forgotRow:  { alignItems: 'flex-end', marginBottom: 16 },
  forgotText: { fontSize: 13, color: colors.brand, fontWeight: '600' },

  mobileRow:  { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 14 },
  dialCode:   { backgroundColor: colors.bg2, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center' },
  dialText:   { fontSize: 14, color: colors.textSec, fontWeight: '600' },
  resendRow:  { alignItems: 'center', marginTop: 12 },
  resendText: { fontSize: 13, color: colors.brand, fontWeight: '600' },

  orRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { fontSize: 12, color: colors.textMuted },

  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  registerText: { fontSize: 13, color: colors.textSec },
  registerLink: { fontSize: 13, color: colors.brand, fontWeight: '700' },

  platformRow:   { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 32, marginBottom: 8 },
  platformDot:   { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  platformLabel: { textAlign: 'center', fontSize: 11, color: colors.textMuted },
});
