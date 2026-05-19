// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { Button, InputField } from '../../components/UI';
import { useAuthStore } from '../../store/authStore';
import { MOCK_USER } from '../../services/mockData';
import type { RootStackParamList } from '../../types';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [mobile, setMobile]   = useState('');
  const [password, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  async function handleRegister() {
    if (!name || !email || !password)
      return Alert.alert('Missing fields', 'Please fill in all required fields');
    if (password.length < 8)
      return Alert.alert('Weak password', 'Password must be at least 8 characters');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    // In production: call authApi.register(name, email, password, '+91' + mobile)
    setAuth({ ...MOCK_USER, name }, 'demo_token_xyz');
    navigation.navigate('Onboarding');
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.logoRow}>
          <View style={styles.logoBox}><Text style={styles.logoIcon}>⚡</Text></View>
          <Text style={styles.logoText}>OmniPost</Text>
        </View>

        <Text style={styles.h1}>Create account</Text>
        <Text style={styles.sub}>Start your 14-day free Creator trial — no card needed</Text>

        <View style={styles.trialBadge}>
          <Text style={styles.trialText}>🎉 14-day free Creator trial included</Text>
        </View>

        <InputField label="Full Name *" value={name}   onChangeText={setName}   placeholder="Priya Sharma" />
        <InputField label="Email *"     value={email}  onChangeText={setEmail}  keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
        <View style={styles.mobileRow}>
          <View style={styles.dialCode}><Text style={styles.dialText}>+91</Text></View>
          <InputField value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholder="98765 43210" style={{ flex: 1, marginBottom: 0 }} label="" />
        </View>
        <InputField label="Password *" value={password} onChangeText={setPass} secureTextEntry placeholder="Min 8 chars, uppercase, number" />

        <Text style={styles.hint}>By creating an account you agree to our Terms of Service and Privacy Policy.</Text>

        <Button label="Create Account →" onPress={handleRegister} loading={loading} style={{ marginTop: 4 }} />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg0 },
  scroll:  { padding: Spacing.xl, paddingTop: 56 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoBox: { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  logoIcon:{ fontSize: 20 },
  logoText:{ fontSize: 22, fontWeight: '900', color: Colors.text },
  h1:   { fontSize: 26, fontWeight: '900', color: Colors.text, marginBottom: 6 },
  sub:  { fontSize: 14, color: Colors.textSec, marginBottom: 18 },
  trialBadge: { backgroundColor: Colors.successDim, borderRadius: 10, borderWidth: 1, borderColor: Colors.success + '44', padding: 12, marginBottom: 20 },
  trialText:  { fontSize: 13, color: Colors.success, fontWeight: '600', textAlign: 'center' },
  mobileRow:  { flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 14 },
  dialCode:   { backgroundColor: Colors.bg2, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12 },
  dialText:   { fontSize: 14, color: Colors.textSec, fontWeight: '600' },
  hint:       { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginBottom: 14, lineHeight: 16 },
  loginRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText:  { fontSize: 13, color: Colors.textSec },
  loginLink:  { fontSize: 13, color: Colors.brand, fontWeight: '700' },
});


// ── OnboardingScreen ───────────────────────────────────────────
import { useAuthStore as useAuth } from '../../store/authStore';
import { PLATFORMS } from '../../constants/platforms';

export function OnboardingScreen({ navigation }: { navigation: any }) {
  const [step, setStep]   = useState(0);
  const [connected, setConnected] = useState<string[]>([]);

  const steps = ['Welcome', 'Connect', 'Plan', 'Done'];

  const phase1 = Object.values(PLATFORMS).filter(p => p.phase === 1);

  function toggleConnect(id: string) {
    setConnected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg0 }}>
      {/* Progress */}
      <View style={onbStyles.progressBar}>
        {steps.map((s, i) => (
          <View key={s} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={[onbStyles.stepDot, i <= step && onbStyles.stepDotActive]}>
              <Text style={[onbStyles.stepNum, i <= step && onbStyles.stepNumActive]}>{i + 1}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[onbStyles.stepLine, i < step && onbStyles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={onbStyles.content}>
        {step === 0 && (
          <View style={onbStyles.centerBox}>
            <Text style={onbStyles.bigEmoji}>⚡</Text>
            <Text style={onbStyles.stepTitle}>Welcome to OmniPost!</Text>
            <Text style={onbStyles.stepDesc}>Let's get your account set up in 3 quick steps. You'll be posting to all platforms in minutes.</Text>
            <Button label="Let's Get Started →" onPress={() => setStep(1)} style={{ marginTop: 24 }} />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={onbStyles.stepTitle}>Connect Your Platforms</Text>
            <Text style={onbStyles.stepDesc}>Select the platforms you use. You can always add more in Settings.</Text>
            <View style={onbStyles.platformGrid}>
              {phase1.map(p => {
                const sel = connected.includes(p.id);
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => toggleConnect(p.id)}
                    style={[onbStyles.platformCard, sel && { borderColor: p.color, backgroundColor: p.color + '18' }]}
                  >
                    <View style={[onbStyles.platformIcon, { backgroundColor: p.color + '22' }]}>
                      <Text style={{ color: p.color, fontWeight: '800', fontSize: 12 }}>{p.abbr}</Text>
                    </View>
                    <Text style={[onbStyles.platformName, sel && { color: Colors.text }]}>{p.name}</Text>
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
            <Text style={onbStyles.stepTitle}>Choose Your Plan</Text>
            <Text style={onbStyles.stepDesc}>Start with a 14-day free trial. Cancel anytime.</Text>
            {[
              { id: 'creator', name: 'Creator', price: '₹499/mo', trial: true, features: ['10 connected accounts','Unlimited posts','Scheduling','5 GB media'] },
              { id: 'agency',  name: 'Agency',  price: '₹1,499/mo', trial: true, features: ['Unlimited accounts','10 team members','50 GB media','Priority support'] },
            ].map(plan => (
              <TouchableOpacity key={plan.id} style={[onbStyles.planCard, plan.id === 'creator' && onbStyles.planCardActive]}
                onPress={() => setStep(3)}>
                {plan.id === 'creator' && <View style={onbStyles.popularBadge}><Text style={onbStyles.popularText}>Most Popular</Text></View>}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={onbStyles.planName}>{plan.name}</Text>
                  <View>
                    <Text style={onbStyles.planPrice}>{plan.price}</Text>
                    {plan.trial && <Text style={onbStyles.planTrial}>14 days FREE</Text>}
                  </View>
                </View>
                {plan.features.map(f => (
                  <Text key={f} style={onbStyles.planFeature}>✓  {f}</Text>
                ))}
              </TouchableOpacity>
            ))}
            <Button label="Start Free Trial →" onPress={() => setStep(3)} style={{ marginTop: 12 }} />
            <Button label="Continue with Free plan" onPress={() => setStep(3)} variant="ghost" style={{ marginTop: 8 }} />
          </View>
        )}

        {step === 3 && (
          <View style={onbStyles.centerBox}>
            <Text style={onbStyles.bigEmoji}>🎉</Text>
            <Text style={onbStyles.stepTitle}>You're all set!</Text>
            <Text style={onbStyles.stepDesc}>Your OmniPost account is ready. Start creating content and publishing to all your platforms.</Text>
            <Button label="Go to Dashboard →" onPress={() => navigation.replace('Main')} style={{ marginTop: 24 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const onbStyles = StyleSheet.create({
  progressBar: { flexDirection: 'row', padding: 20, paddingTop: 52, alignItems: 'center' },
  stepDot:     { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive:{ backgroundColor: Colors.brand, borderColor: Colors.brand },
  stepNum:     { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  stepNumActive:{ color: Colors.white },
  stepLine:    { flex: 1, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  stepLineActive:{ backgroundColor: Colors.brand },
  content:     { padding: Spacing.xl, paddingTop: 16 },
  centerBox:   { alignItems: 'center', paddingTop: 32 },
  bigEmoji:    { fontSize: 60, marginBottom: 16 },
  stepTitle:   { fontSize: 22, fontWeight: '900', color: Colors.text, marginBottom: 10, textAlign: 'center' },
  stepDesc:    { fontSize: 14, color: Colors.textSec, textAlign: 'center', lineHeight: 22, marginBottom: 4 },
  platformGrid:{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  platformCard:{ width: '47%', padding: 14, backgroundColor: Colors.bg2, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 6 },
  platformIcon:{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  platformName:{ fontSize: 12, fontWeight: '600', color: Colors.textSec, textAlign: 'center' },
  planCard:    { backgroundColor: Colors.bg2, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 18, marginBottom: 12, position: 'relative' },
  planCardActive:{ borderColor: Colors.brandBdr, backgroundColor: Colors.brandDim },
  popularBadge:{ position: 'absolute', top: -10, alignSelf: 'center', backgroundColor: Colors.brand, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  popularText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  planName:    { fontSize: 16, fontWeight: '800', color: Colors.text },
  planPrice:   { fontSize: 15, fontWeight: '800', color: Colors.brand, textAlign: 'right' },
  planTrial:   { fontSize: 10, color: Colors.success, fontWeight: '700', textAlign: 'right' },
  planFeature: { fontSize: 12, color: Colors.textSec, marginTop: 5, lineHeight: 18 },
});
