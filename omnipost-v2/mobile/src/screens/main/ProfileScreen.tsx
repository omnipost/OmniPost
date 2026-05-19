// src/screens/main/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Card, Button, Badge, PlatformIcon, InputField, Toggle, Divider } from '../../components/UI';
import { useAuthStore } from '../../store/authStore';
import { MOCK_ACCOUNTS } from '../../services/mockData';
import Toast from 'react-native-toast-message';

type SettingsTab = 'profile' | 'accounts' | 'notifications' | 'security' | 'billing';

export default function ProfileScreen({ navigation }: any) {
  const [tab, setTab]           = useState<SettingsTab>('profile');
  const { user, logout }        = useAuthStore();
  const [name, setName]         = useState(user?.name ?? '');
  const [bio, setBio]           = useState(user?.bio  ?? '');
  const [notifs, setNotifs]     = useState({ success: true, failed: true, tokenExpiry: true, scheduled: true, weekly: false });
  const [saving, setSaving]     = useState(false);

  const TABS: { id: SettingsTab; label: string; emoji: string }[] = [
    { id: 'profile',       label: 'Profile',       emoji: '👤' },
    { id: 'accounts',      label: 'Accounts',      emoji: '🔗' },
    { id: 'notifications', label: 'Notifications', emoji: '🔔' },
    { id: 'security',      label: 'Security',      emoji: '🔒' },
    { id: 'billing',       label: 'Billing',       emoji: '💳' },
  ];

  async function saveProfile() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    // In production: call usersApi.updateProfile({ name, bio })
    Toast.show({ type: 'success', text1: 'Profile updated!' });
    setSaving(false);
  }

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* User header */}
      <View style={styles.userHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0] ?? 'P'}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
            <Badge label={`${user?.plan ?? 'free'} plan`} variant="brand" />
            {user?.isVerified && <Badge label="✓ Verified" variant="success" />}
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}>
            <Text style={styles.tabEmoji}>{t.emoji}</Text>
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <Card>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <InputField label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
          <InputField label="Email" value={user?.email ?? ''} editable={false} placeholder="email@example.com" />
          <InputField label="Mobile" value={user?.mobile ?? ''} keyboardType="phone-pad" placeholder="+91 98765 43210" />
          <InputField label="Bio" value={bio} onChangeText={setBio} multiline placeholder="Tell your audience about yourself" />
          <InputField label="Language" value="English" editable={false} />
          <Button label="Save Changes" onPress={saveProfile} loading={saving} style={{ marginTop: 4 }} />
        </Card>
      )}

      {/* Accounts Tab */}
      {tab === 'accounts' && (
        <View>
          <Card style={{ marginBottom: 14 }}>
            <Text style={styles.sectionTitle}>Connected Accounts</Text>
            {MOCK_ACCOUNTS.map(acc => (
              <View key={acc.id} style={styles.accountRow}>
                <PlatformIcon platformId={acc.platform} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountName}>{acc.displayName}</Text>
                  <Text style={styles.accountSub}>{acc.username} · {acc.followersCount.toLocaleString('en-IN')} followers</Text>
                </View>
                {acc.status === 'connected'
                  ? <Badge label="✓ Connected" variant="success" />
                  : (
                    <TouchableOpacity
                      onPress={() => Toast.show({ type: 'info', text1: 'Reconnecting…' })}
                      style={styles.reconnectBtn}
                    >
                      <Text style={styles.reconnectText}>Reconnect</Text>
                    </TouchableOpacity>
                  )
                }
              </View>
            ))}
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Add Platform</Text>
            <Text style={styles.sectionSub}>Phase 1 — Available Now</Text>
            <View style={styles.platformGrid}>
              {['instagram','twitter','facebook','youtube','linkedin','threads'].map(pid => {
                const already = MOCK_ACCOUNTS.some(a => a.platform === pid);
                return (
                  <TouchableOpacity key={pid} onPress={() => !already && Toast.show({ type: 'info', text1: 'OAuth connecting…' })}
                    style={[styles.platformCard, already && styles.platformCardConnected]}>
                    <PlatformIcon platformId={pid} size={30} />
                    <Text style={styles.platformName}>{pid.charAt(0).toUpperCase() + pid.slice(1)}</Text>
                    <Text style={[styles.platformStatus, { color: already ? Colors.success : Colors.textMuted }]}>{already ? '✓' : 'Connect'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <Card>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          {[
            { key: 'success',    label: 'Post published',    desc: 'When all platforms succeed' },
            { key: 'failed',     label: 'Post failed',       desc: 'When publishing fails' },
            { key: 'tokenExpiry',label: 'Token expiry',      desc: 'Before platform token expires' },
            { key: 'scheduled',  label: 'Scheduled reminder',desc: '15 min before scheduled posts' },
            { key: 'weekly',     label: 'Weekly report',     desc: 'Analytics summary every Monday' },
          ].map(item => (
            <View key={item.key} style={styles.notifRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifLabel}>{item.label}</Text>
                <Text style={styles.notifDesc}>{item.desc}</Text>
              </View>
              <Toggle value={(notifs as any)[item.key]} onChange={v => setNotifs(p => ({ ...p, [item.key]: v }))} />
            </View>
          ))}
          <Button label="Save Preferences" onPress={() => Toast.show({ type: 'success', text1: 'Saved!' })} style={{ marginTop: 8 }} />
        </Card>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <Card>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          <InputField label="Current Password" secureTextEntry placeholder="••••••••" />
          <InputField label="New Password" secureTextEntry placeholder="Min 8 chars" />
          <InputField label="Confirm New Password" secureTextEntry placeholder="••••••••" />
          <Button label="Update Password" onPress={() => Toast.show({ type: 'success', text1: 'Password updated!' })} style={{ marginTop: 4 }} />
          <Divider />
          <View style={styles.mfaRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifLabel}>Two-Factor Authentication</Text>
              <Text style={styles.notifDesc}>Secure with SMS OTP</Text>
            </View>
            <Button label="Enable MFA" onPress={() => Toast.show({ type: 'info', text1: 'MFA setup coming…' })} variant="secondary" style={{ paddingHorizontal: 12, paddingVertical: 8 }} />
          </View>
          <Divider />
          <Button label="Delete Account" onPress={() => Alert.alert('Delete Account', 'This is irreversible. Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }])} variant="danger" style={{ marginTop: 8 }} />
        </Card>
      )}

      {/* Billing Tab */}
      {tab === 'billing' && (
        <View>
          <Card style={{ marginBottom: 14, borderColor: Colors.brandBdr, backgroundColor: Colors.brandDim }}>
            <Text style={styles.sectionTitle}>Current Plan</Text>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Creator Plan</Text>
              <Text style={styles.planPrice}>₹499<Text style={styles.planPer}>/month</Text></Text>
            </View>
            <Text style={styles.planRenew}>Renews on June 15, 2025</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button label="Upgrade to Agency" onPress={() => Toast.show({ type: 'info', text1: 'Redirecting to Razorpay…' })} style={{ flex: 1 }} />
              <Button label="Cancel" onPress={() => Alert.alert('Cancel Plan', 'Your plan will end on the renewal date.')} variant="secondary" style={{ flex: 1 }} />
            </View>
          </Card>

          <Card style={{ marginBottom: 14 }}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            {['UPI (GPay, PhonePe, Paytm)', 'Net Banking', 'Credit / Debit Card', 'EMI available'].map(m => (
              <View key={m} style={styles.paymentRow}><Text style={styles.paymentItem}>✓ {m}</Text></View>
            ))}
            <Text style={styles.paymentNote}>Powered by Razorpay · GST invoices · RBI compliant</Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Invoice History</Text>
            {[
              { date: 'May 1, 2025', amount: '₹499', status: 'Paid' },
              { date: 'Apr 1, 2025', amount: '₹499', status: 'Paid' },
              { date: 'Mar 1, 2025', amount: '₹499', status: 'Paid' },
            ].map((inv, i) => (
              <View key={i} style={styles.invoiceRow}>
                <Text style={styles.invoiceDate}>{inv.date}</Text>
                <Text style={styles.invoiceAmount}>{inv.amount}</Text>
                <Badge label={inv.status} variant="success" />
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Logout */}
      <Button label="Log Out" onPress={handleLogout} variant="danger" style={{ marginTop: 20 }} />
      <Text style={styles.version}>OmniPost v1.0.0 · India 🇮🇳</Text>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg0 },
  content: { padding: Spacing.lg },

  userHeader:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.bg2, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 16 },
  avatar:      { width: 52, height: 52, borderRadius: 14, backgroundColor: Colors.brand + '44', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 22, fontWeight: '900', color: Colors.brand },
  userName:    { fontSize: 16, fontWeight: '800', color: Colors.text },
  userEmail:   { fontSize: 12, color: Colors.textMuted },

  tabRow:      { gap: 8, marginBottom: 16 },
  tabBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: Colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  tabBtnActive:{ backgroundColor: Colors.brand, borderColor: Colors.brand },
  tabEmoji:    { fontSize: 13 },
  tabLabel:    { fontSize: 12, color: Colors.textSec, fontWeight: '600' },
  tabLabelActive:{ color: Colors.white },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  sectionSub:   { fontSize: 12, color: Colors.textMuted, marginBottom: 10, marginTop: -8 },

  accountRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  accountName:    { fontSize: 13, fontWeight: '700', color: Colors.text },
  accountSub:     { fontSize: 11, color: Colors.textMuted },
  reconnectBtn:   { backgroundColor: Colors.brand, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  reconnectText:  { fontSize: 12, fontWeight: '700', color: Colors.white },

  platformGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformCard:   { width: '30%', alignItems: 'center', padding: 12, backgroundColor: Colors.bg3, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, gap: 5 },
  platformCardConnected: { borderColor: Colors.success + '44', backgroundColor: Colors.successDim },
  platformName:   { fontSize: 11, fontWeight: '600', color: Colors.text },
  platformStatus: { fontSize: 11, fontWeight: '700' },

  notifRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  notifLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  notifDesc:  { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  mfaRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },

  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planName:   { fontSize: 18, fontWeight: '900', color: Colors.text },
  planPrice:  { fontSize: 22, fontWeight: '900', color: Colors.brand },
  planPer:    { fontSize: 13, color: Colors.textMuted, fontWeight: '400' },
  planRenew:  { fontSize: 12, color: Colors.textMuted },

  paymentRow:  { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  paymentItem: { fontSize: 13, color: Colors.textSec },
  paymentNote: { fontSize: 11, color: Colors.textMuted, marginTop: 10 },

  invoiceRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  invoiceDate:  { flex: 1, fontSize: 13, color: Colors.textSec },
  invoiceAmount:{ fontSize: 13, fontWeight: '700', color: Colors.text, marginRight: 10 },

  version: { textAlign: 'center', fontSize: 11, color: Colors.textMuted, marginTop: 16 },
});
