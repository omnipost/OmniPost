import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import AuthLayout from '../../components/AuthLayout';
import { Button, InputField } from '../../components/UI';
import { Spacing, Radius, useTheme } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';
import { parseAuthResponse, getApiError } from '../../utils/authHelpers';
import { PLATFORMS } from '../../constants/platforms';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [mobile, setMobile]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { setAuth } = useAuthStore();

  async function handleRegister() {
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email and password are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(
        name.trim(),
        email.trim(),
        password,
        mobile.trim() || undefined
      );
      const { user, accessToken } = parseAuthResponse(res);
      setAuth(user, accessToken);
      Toast.show({ type: 'success', text1: 'Account created!', text2: 'Welcome to OmniPost' });
      navigation.replace('Onboarding');
    } catch (err) {
      setError(getApiError(err, 'Could not create account.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start publishing to all your platforms in minutes."
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSec }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.footerLink, { color: colors.brand }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={[styles.badge, { backgroundColor: colors.successDim, borderColor: colors.success + '44' }]}>
        <Text style={[styles.badgeText, { color: colors.success }]}>Free plan included — no card required</Text>
      </View>

      <InputField label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />

      <View style={styles.mobileRow}>
        <View style={[styles.dialCode, { backgroundColor: colors.bg2, borderColor: colors.border }]}>
          <Text style={[styles.dialText, { color: colors.textSec }]}>+91</Text>
        </View>
        <View style={{ flex: 1 }}>
          <InputField
            label="Mobile (optional)"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            placeholder="98765 43210"
          />
        </View>
      </View>

      <InputField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Min. 8 characters"
      />
      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
      <Text style={[styles.hint, { color: colors.textMuted }]}> 
        By signing up you agree to our Terms of Service and Privacy Policy.
      </Text>

      <Button label="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
    </AuthLayout>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    badge: {
      borderRadius: Radius.md, borderWidth: 1,
      padding: Spacing.md, marginBottom: Spacing.lg,
    },
    badgeText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
    mobileRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
    dialCode: {
      borderRadius: Radius.md, borderWidth: 1,
      paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
    },
    dialText: { fontSize: 14, fontWeight: '600' },
    errorText: { marginBottom: 10, fontSize: 13, fontWeight: '600' },
    hint: { fontSize: 11, textAlign: 'center', lineHeight: 16, marginBottom: 8 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { fontSize: 14 },
    footerLink: { fontSize: 14, fontWeight: '700' },
  });

// ── Onboarding (unchanged flow) ──────────────────────────────
export function OnboardingScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const ob = React.useMemo(() => getObStyles(colors, insets), [colors, insets]);
  const [step, setStep]           = React.useState(0);
  const [connected, setConnected] = React.useState<string[]>([]);
  const steps = ['Welcome', 'Connect', 'Plan', 'Done'];
  const allPlatforms = Object.entries(PLATFORMS).map(([id, p]) => ({ id, ...p }));

  function toggleConnect(id: string) {
    setConnected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <View style={ob.progressBar}>
        {steps.map((s, i) => (
          <View key={s} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={[ob.stepDot, i <= step && ob.stepDotActive]}>
              <Text style={[ob.stepNum, i <= step && ob.stepNumActive]}>{i + 1}</Text>
            </View>
            {i < steps.length - 1 && <View style={[ob.stepLine, i < step && ob.stepLineActive]} />}
          </View>
        ))}
      </View>
      <View style={ob.content}>
        {step === 0 && (
          <View style={ob.centerBox}>
            <Text style={ob.bigEmoji}>⚡</Text>
            <Text style={ob.stepTitle}>Welcome to OmniPost!</Text>
            <Text style={ob.stepDesc}>Let's get your account set up in 3 quick steps.</Text>
            <Button label="Let's Get Started →" onPress={() => setStep(1)} style={{ marginTop: 24 }} />
          </View>
        )}
        {step === 1 && (
          <View>
            <Text style={ob.stepTitle}>Connect Your Platforms</Text>
            <Text style={ob.stepDesc}>Select the platforms you use.</Text>
            <View style={ob.platformGrid}>
              {allPlatforms.map(p => {
                const sel = connected.includes(p.id);
                return (
                  <TouchableOpacity key={p.id} onPress={() => toggleConnect(p.id)}
                    style={[ob.platformCard, sel && { borderColor: p.color, backgroundColor: p.color + '18' }]}>
                    <View style={[ob.platformIcon, { backgroundColor: p.color + '22' }]}>
                      <Text style={{ color: p.color, fontWeight: '800', fontSize: 12 }}>{p.abbr}</Text>
                    </View>
                    <Text style={[ob.platformName, sel && { color: colors.text }]}>{p.name}</Text>
                    {sel && <Text style={{ color: p.color, fontSize: 16, position: 'absolute', top: 6, right: 8 }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Button label={`Continue (${connected.length} selected) →`} onPress={() => setStep(2)} style={{ marginTop: 20 }} />
            <Button label="Skip for now" onPress={() => setStep(2)} variant="ghost" style={{ marginTop: 8 }} />
          </View>
        )}
        {step === 2 && (
          <View>
            <Text style={ob.stepTitle}>Choose Your Plan</Text>
            <Text style={ob.stepDesc}>Start with a free plan. Upgrade anytime.</Text>
            {[
              { id: 'creator', name: 'Creator', price: '₹499/mo', features: ['10 accounts','Unlimited posts','Scheduling','5 GB media'] },
              { id: 'agency',  name: 'Agency',  price: '₹1,499/mo', features: ['Unlimited accounts','10 team members','50 GB media'] },
            ].map(plan => (
              <TouchableOpacity key={plan.id} style={[ob.planCard, plan.id === 'creator' && ob.planCardActive]} onPress={() => setStep(3)}>
                {plan.id === 'creator' && <View style={ob.popularBadge}><Text style={ob.popularText}>Most Popular</Text></View>}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={ob.planName}>{plan.name}</Text>
                  <Text style={ob.planPrice}>{plan.price}</Text>
                </View>
                {plan.features.map(f => <Text key={f} style={ob.planFeature}>✓  {f}</Text>)}
              </TouchableOpacity>
            ))}
            <Button label="Continue →" onPress={() => setStep(3)} style={{ marginTop: 12 }} />
          </View>
        )}
        {step === 3 && (
          <View style={ob.centerBox}>
            <Text style={ob.bigEmoji}>🎉</Text>
            <Text style={ob.stepTitle}>You're all set!</Text>
            <Text style={ob.stepDesc}>Your OmniPost account is ready.</Text>
            <Button label="Go to Dashboard →" onPress={() => navigation.replace('Main')} style={{ marginTop: 24 }} />
          </View>
        )}
      </View>
    </View>
  );
}

const getObStyles = (colors: ReturnType<typeof useTheme>['colors'], insets: any) =>
  StyleSheet.create({
    progressBar:    { flexDirection: 'row', padding: 20, paddingTop: Math.max(insets.top + 10, 40), alignItems: 'center' },
    stepDot:        { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    stepDotActive:  { backgroundColor: colors.brand, borderColor: colors.brand },
    stepNum:        { fontSize: 12, fontWeight: '700', color: colors.textMuted },
    stepNumActive:  { color: colors.white },
    stepLine:       { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 4 },
    stepLineActive: { backgroundColor: colors.brand },
    content:        { padding: Spacing.xl, paddingTop: 16, paddingBottom: insets.bottom + 16, flex: 1 },
    centerBox:      { alignItems: 'center', paddingTop: 32 },
    bigEmoji:       { fontSize: 60, marginBottom: 16 },
    stepTitle:      { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 10, textAlign: 'center' },
    stepDesc:       { fontSize: 14, color: colors.textSec, textAlign: 'center', lineHeight: 22 },
    platformGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
    platformCard:   { width: '47%', padding: 14, backgroundColor: colors.bg2, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 6 },
    platformIcon:   { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    platformName:   { fontSize: 12, fontWeight: '600', color: colors.textSec, textAlign: 'center' },
    planCard:       { backgroundColor: colors.bg2, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 18, marginBottom: 12, position: 'relative' },
    planCardActive: { borderColor: colors.brandBdr, backgroundColor: colors.brandDim },
    popularBadge:   { position: 'absolute', top: -10, alignSelf: 'center', backgroundColor: colors.brand, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
    popularText:    { fontSize: 10, fontWeight: '700', color: colors.white },
    planName:       { fontSize: 16, fontWeight: '800', color: colors.text },
    planPrice:      { fontSize: 15, fontWeight: '800', color: colors.brand },
    planFeature:    { fontSize: 12, color: colors.textSec, marginTop: 5, lineHeight: 18 },
  });