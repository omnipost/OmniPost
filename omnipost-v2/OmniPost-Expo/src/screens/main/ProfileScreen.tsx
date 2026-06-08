// src/screens/main/ProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Spacing, useTheme, Colors } from '../../constants/theme';
import { Card, Button, Badge, PlatformIcon, InputField, Toggle, Divider } from '../../components/UI';
import { useAuthStore } from '../../store/authStore';
import { MOCK_ACCOUNTS } from '../../services/mockData';
import Toast from 'react-native-toast-message';

type SettingsTab = 'profile' | 'accounts' | 'notifications' | 'security' | 'billing';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = React.useMemo(() => getStyles(colors), [colors]);
  const [tab, setTab] = useState<SettingsTab>('profile');
  const { user, logout, isAuthenticated } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [notifs, setNotifs] = useState({ success: true, failed: true, tokenExpiry: true, scheduled: true, weekly: false });
  const [saving, setSaving] = useState(false);

  const TABS: { id: SettingsTab; label: string; emoji: string }[] = [
    { id: 'profile', label: 'Profile', emoji: '👤' },
    { id: 'accounts', label: 'Accounts', emoji: '🔗' },
    { id: 'notifications', label: 'Notifications', emoji: '🔔' },
    { id: 'security', label: 'Security', emoji: '🔒' },
    { id: 'billing', label: 'Billing', emoji: '💳' },
  ];

  async function saveProfile() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    Toast.show({ type: 'success', text1: 'Profile updated!' });
    setSaving(false);
  }

  React.useEffect(() => {
    if (!isAuthenticated) {
      const rootNav = navigation.getParent()?.getParent();
      if (rootNav?.dispatch) {
        rootNav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
      }
    }
  }, [isAuthenticated, navigation]);

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.userHeader}>
        <View style={s.avatar}><Text style={s.avatarText}>{user?.name?.[0] ?? 'P'}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.userName}>{user?.name}</Text>
          <Text style={s.userEmail}>{user?.email}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
            <Badge label={`${user?.plan ?? 'free'} plan`} variant="brand" />
            {user?.isVerified && <Badge label="✓ Verified" variant="success" />}
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[s.tabBtn, tab === t.id && s.tabBtnActive]}>
            <Text style={s.tabEmoji}>{t.emoji}</Text>
            <Text style={[s.tabLabel, tab === t.id && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {tab === 'profile' && (
        <Card>
          <Text style={s.sectionTitle}>Profile Information</Text>
          <InputField label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
          <InputField label="Email" value={user?.email ?? ''} editable={false} placeholder="email@example.com" />
          <InputField label="Mobile" value={user?.mobile ?? ''} keyboardType="phone-pad" placeholder="+91 98765 43210" />
          <InputField label="Bio" value={bio} onChangeText={setBio} multiline placeholder="Tell your audience about yourself" />
          <InputField label="Language" value="English" editable={false} />
          <Button label="Save Changes" onPress={saveProfile} loading={saving} style={{ marginTop: 4 }} />
        </Card>
      )}

      {tab === 'accounts' && (
        <View>
          <Card style={{ marginBottom: 14 }}>
            <Text style={s.sectionTitle}>Connected Accounts</Text>
            {MOCK_ACCOUNTS.map(acc => (
              <View key={acc.id} style={s.accountRow}>
                <PlatformIcon platformId={acc.platform} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={s.accountName}>{acc.displayName}</Text>
                  <Text style={s.accountSub}>{acc.username} · {acc.followersCount.toLocaleString('en-IN')} followers</Text>
                </View>
                {acc.status === 'connected'
                  ? <Badge label="✓ Connected" variant="success" />
                  : (
                    <TouchableOpacity onPress={() => Toast.show({ type: 'info', text1: 'Reconnecting…' })} style={s.reconnectBtn}>
                      <Text style={s.reconnectText}>Reconnect</Text>
                    </TouchableOpacity>
                  )
                }
              </View>
            ))}
          </Card>
          <Card>
            <Text style={s.sectionTitle}>Add Platform</Text>
            <Text style={s.sectionSub}>Available platforms</Text>
            <View style={s.platformGrid}>
              {['instagram', 'twitter', 'facebook', 'youtube', 'linkedin', 'threads'].map(pid => {
                const already = MOCK_ACCOUNTS.some(a => a.platform === pid);
                return (
                  <TouchableOpacity key={pid}
                    onPress={() => !already && Toast.show({ type: 'info', text1: 'OAuth connecting…' })}
                    style={[s.platformCard, already && s.platformCardConnected]}>
                    <PlatformIcon platformId={pid} size={30} />
                    <Text style={s.platformName}>{pid.charAt(0).toUpperCase() + pid.slice(1)}</Text>
                    <Text style={[s.platformStatus, { color: already ? colors.success : colors.textMuted }]}>{already ? '✓' : 'Connect'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>
      )}

      {tab === 'notifications' && (
        <Card>
          <Text style={s.sectionTitle}>Notification Preferences</Text>
          {[
            { key: 'success', label: 'Post published', desc: 'When all platforms succeed' },
            { key: 'failed', label: 'Post failed', desc: 'When publishing fails' },
            { key: 'tokenExpiry', label: 'Token expiry', desc: 'Before platform token expires' },
            { key: 'scheduled', label: 'Scheduled reminder', desc: '15 min before scheduled posts' },
            { key: 'weekly', label: 'Weekly report', desc: 'Analytics summary every Monday' },
          ].map(item => (
            <View key={item.key} style={s.notifRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.notifLabel}>{item.label}</Text>
                <Text style={s.notifDesc}>{item.desc}</Text>
              </View>
              <Toggle value={(notifs as any)[item.key]} onChange={v => setNotifs(p => ({ ...p, [item.key]: v }))} />
            </View>
          ))}
          <Button label="Save Preferences" onPress={() => Toast.show({ type: 'success', text1: 'Saved!' })} style={{ marginTop: 8 }} />
        </Card>
      )}

      {tab === 'security' && (
        <Card>
          <Text style={s.sectionTitle}>Security Settings</Text>
          <InputField label="Current Password" secureTextEntry placeholder="••••••••" />
          <InputField label="New Password" secureTextEntry placeholder="Min 8 chars" />
          <InputField label="Confirm New Password" secureTextEntry placeholder="••••••••" />
          <Button label="Update Password" onPress={() => Toast.show({ type: 'success', text1: 'Password updated!' })} style={{ marginTop: 4 }} />
          <Divider />
          <View style={s.mfaRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.notifLabel}>Two-Factor Authentication</Text>
              <Text style={s.notifDesc}>Secure with SMS OTP</Text>
            </View>
            <Button label="Enable MFA" onPress={() => Toast.show({ type: 'info', text1: 'MFA setup coming…' })} variant="secondary" style={{ paddingHorizontal: 12, paddingVertical: 8 }} />
          </View>
          <Divider />
          <Button label="Delete Account"
            onPress={() => Alert.alert('Delete Account', 'This is irreversible.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }])}
            variant="danger" style={{ marginTop: 8 }} />
        </Card>
      )}

      {tab === 'billing' && (
        <View>
          <Card style={{ marginBottom: 14, borderColor: colors.brandBdr, backgroundColor: colors.brandDim }}>
            <Text style={s.sectionTitle}>Current Plan</Text>
            <View style={s.planHeader}>
              <Text style={s.planName}>Creator Plan</Text>
              <Text style={s.planPrice}>₹499<Text style={s.planPer}>/month</Text></Text>
            </View>
            <Text style={s.planRenew}>Renews on June 15, 2025</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button label="Upgrade to Agency" onPress={() => Toast.show({ type: 'info', text1: 'Redirecting to Razorpay…' })} style={{ flex: 1 }} />
              <Button label="Cancel" onPress={() => Alert.alert('Cancel Plan', 'Your plan will end on the renewal date.')} variant="secondary" style={{ flex: 1 }} />
            </View>
          </Card>
          <Card style={{ marginBottom: 14 }}>
            <Text style={s.sectionTitle}>Payment Methods</Text>
            {['UPI (GPay, PhonePe, Paytm)', 'Net Banking', 'Credit / Debit Card', 'EMI available'].map(m => (
              <View key={m} style={s.paymentRow}><Text style={s.paymentItem}>✓ {m}</Text></View>
            ))}
            <Text style={s.paymentNote}>Powered by Razorpay · GST invoices · RBI compliant</Text>
          </Card>
          <Card>
            <Text style={s.sectionTitle}>Invoice History</Text>
            {[
              { date: 'May 1, 2025', amount: '₹499', status: 'Paid' },
              { date: 'Apr 1, 2025', amount: '₹499', status: 'Paid' },
              { date: 'Mar 1, 2025', amount: '₹499', status: 'Paid' },
            ].map((inv, i) => (
              <View key={i} style={s.invoiceRow}>
                <Text style={s.invoiceDate}>{inv.date}</Text>
                <Text style={s.invoiceAmount}>{inv.amount}</Text>
                <Badge label={inv.status} variant="success" />
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* <Button label="Log Out" onPress={handleLogout} variant="danger" style={{ marginTop: 20 }} /> */}
      <Text style={s.version}>OmniPost v1.0.0 · India 🇮🇳</Text>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const getStyles = (colors: typeof Colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg0 },
  content: { padding: Spacing.lg },
  userHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.bg2, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  avatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.brand + '44', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '900', color: colors.brand },
  userName: { fontSize: 16, fontWeight: '800', color: colors.text },
  userEmail: { fontSize: 12, color: colors.textMuted },
  tabRow: { gap: 8, marginBottom: 16 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  tabBtnActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  tabEmoji: { fontSize: 13 },
  tabLabel: { fontSize: 12, color: colors.textSec, fontWeight: '600' },
  tabLabelActive: { color: colors.white },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 14 },
  sectionSub: { fontSize: 12, color: colors.textMuted, marginBottom: 10, marginTop: -8 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  accountName: { fontSize: 13, fontWeight: '700', color: colors.text },
  accountSub: { fontSize: 11, color: colors.textMuted },
  reconnectBtn: { backgroundColor: colors.brand, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  reconnectText: { fontSize: 12, fontWeight: '700', color: colors.white },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformCard: { width: '30%', alignItems: 'center', padding: 12, backgroundColor: colors.bg3, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 5 },
  platformCardConnected: { borderColor: colors.success + '44', backgroundColor: colors.successDim },
  platformName: { fontSize: 11, fontWeight: '600', color: colors.text },
  platformStatus: { fontSize: 11, fontWeight: '700' },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  notifLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  notifDesc: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  mfaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planName: { fontSize: 18, fontWeight: '900', color: colors.text },
  planPrice: { fontSize: 22, fontWeight: '900', color: colors.brand },
  planPer: { fontSize: 13, color: colors.textMuted, fontWeight: '400' },
  planRenew: { fontSize: 12, color: colors.textMuted },
  paymentRow: { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  paymentItem: { fontSize: 13, color: colors.textSec },
  paymentNote: { fontSize: 11, color: colors.textMuted, marginTop: 10 },
  invoiceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  invoiceDate: { flex: 1, fontSize: 13, color: colors.textSec },
  invoiceAmount: { fontSize: 13, fontWeight: '700', color: colors.text, marginRight: 10 },
  version: { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginTop: 16 },
});
