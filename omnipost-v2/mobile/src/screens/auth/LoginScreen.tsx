// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';
import { Button, InputField } from '../../components/UI';
import { useAuthStore } from '../../store/authStore';
import { DEMO_CREDENTIALS } from '../../constants/platforms';
import { MOCK_USER } from '../../services/mockData';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

type LoginMethod = 'email' | 'mobile';

export default function LoginScreen({ navigation }: Props) {
  const [method, setMethod]       = useState<LoginMethod>('email');
  const [email, setEmail]         = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword]   = useState(DEMO_CREDENTIALS.password);
  const [mobile, setMobile]       = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [otpSent, setOtpSent]     = useState(false);
  const [otp, setOtp]             = useState('');
  const { setAuth }               = useAuthStore();

  async function handleLogin() {
    if (method === 'email') {
      if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      // In production: call authApi.login(email, password)
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        setAuth(MOCK_USER, 'demo_token_xyz');
      } else {
        Alert.alert('Login Failed', `Use ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`);
      }
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    if (!mobile) return Alert.alert('Error', 'Please enter your mobile number');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // In production: call authApi.sendOtp('+91' + mobile)
    setOtpSent(true);
    setLoading(false);
    Alert.alert('OTP Sent', `OTP sent to +91 ${mobile}. Use 123456 for demo.`);
  }

  async function handleVerifyOtp() {
    if (!otp) return Alert.alert('Error', 'Please enter the OTP');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // In production: call authApi.verifyOtp('+91' + mobile, otp)
    setAuth(MOCK_USER, 'demo_token_xyz');
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={styles.logoText}>OmniPost</Text>
        </View>

        {/* Headline */}
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
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                >
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
              <View style={styles.dialCode}><Text style={styles.dialText}>+91</Text></View>
              <InputField
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                placeholder="98765 43210"
                style={{ flex: 1, marginBottom: 0 }}
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
          onPress={() => {
            // In production: implement Google Sign-In
            setAuth(MOCK_USER, 'demo_token_xyz');
          }}
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

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg0 },
  scroll:  { padding: Spacing.xl, paddingTop: 56 },

  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoBox:  { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 20 },
  logoText: { fontSize: 22, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },

  h1:  { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: 14, color: Colors.textSec, marginBottom: 22 },

  demoBanner: { backgroundColor: Colors.brandDim, borderRadius: 12, borderWidth: 1, borderColor: Colors.brandBdr, padding: 14, marginBottom: 20 },
  demoTitle:  { fontSize: 13, fontWeight: '700', color: Colors.brand, marginBottom: 6 },
  demoText:   { fontSize: 12, color: Colors.textSec, marginBottom: 2 },
  demoCode:   { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: Colors.text },

  methodRow:       { flexDirection: 'row', backgroundColor: Colors.bg2, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 4, marginBottom: 18, gap: 4 },
  methodBtn:       { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  methodBtnActive: { backgroundColor: Colors.brand },
  methodText:      { fontSize: 13, fontWeight: '600', color: Colors.textSec },
  methodTextActive:{ color: Colors.white },

  fieldLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  passRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:     { padding: 10 },
  eyeIcon:    { fontSize: 18 },
  forgotRow:  { alignItems: 'flex-end', marginBottom: 16 },
  forgotText: { fontSize: 13, color: Colors.brand, fontWeight: '600' },

  mobileRow:  { flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 14 },
  dialCode:   { backgroundColor: Colors.bg2, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center' },
  dialText:   { fontSize: 14, color: Colors.textSec, fontWeight: '600' },
  resendRow:  { alignItems: 'center', marginTop: 12 },
  resendText: { fontSize: 13, color: Colors.brand, fontWeight: '600' },

  orRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { fontSize: 12, color: Colors.textMuted },

  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  registerText: { fontSize: 13, color: Colors.textSec },
  registerLink: { fontSize: 13, color: Colors.brand, fontWeight: '700' },

  platformRow:  { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 32, marginBottom: 8 },
  platformDot:  { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  platformLabel:{ textAlign: 'center', fontSize: 11, color: Colors.textMuted },
});
