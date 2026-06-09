// src/screens/main/ProfileScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Platform, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spacing, useTheme, Colors } from '../../constants/theme';
import { Card, Button, Badge, PlatformIcon, InputField, Toggle, Divider } from '../../components/UI';
import { useAuthStore } from '../../store/authStore';
import { MOCK_ACCOUNTS } from '../../services/mockData';
import { usersApi } from '../../services/api';
import Toast from 'react-native-toast-message';

type SettingsTab = 'profile' | 'accounts' | 'notifications' | 'security' | 'billing';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = React.useMemo(() => getStyles(colors), [colors]);
  const [tab, setTab] = useState<SettingsTab>('profile');
  const { user, logout, updateUser } = useAuthStore();

  // ── Edit-mode state ────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable draft fields (only committed on Save)
  const [draftName,   setDraftName]   = useState(user?.name   ?? '');
  const [draftBio,    setDraftBio]    = useState(user?.bio    ?? '');
  const [draftMobile, setDraftMobile] = useState(user?.mobile ?? '');

  // Notification prefs (local-only for now)
  const [notifs, setNotifs] = useState({
    success: true, failed: true, tokenExpiry: true, scheduled: true, weekly: false,
  });

  const TABS: { id: SettingsTab; label: string; emoji: string }[] = [
    { id: 'profile',       label: 'Profile',       emoji: '👤' },
    { id: 'accounts',      label: 'Accounts',      emoji: '🔗' },
    { id: 'notifications', label: 'Notifications', emoji: '🔔' },
    { id: 'security',      label: 'Security',      emoji: '🔒' },
    { id: 'billing',       label: 'Billing',       emoji: '💳' },
  ];

  // ── Enter edit mode ────────────────────────────────────────────
  function startEditing() {
    // Reload drafts from current store values each time edit is opened
    setDraftName(user?.name ?? '');
    setDraftBio(user?.bio ?? '');
    setDraftMobile(user?.mobile ?? '');
    setIsEditing(true);
  }

  // ── Cancel edits ───────────────────────────────────────────────
  function cancelEditing() {
    setIsEditing(false);
    // Drafts will be re-seeded from store next time edit opens
  }

  // ── Save to database ───────────────────────────────────────────
  async function saveProfile() {
    if (!draftName.trim()) {
      Toast.show({ type: 'error', text1: 'Name cannot be empty' });
      return;
    }
    setSaving(true);
    try {
      const { data: res } = await usersApi.updateProfile({
        name:   draftName.trim(),
        bio:    draftBio.trim(),
        mobile: draftMobile.trim() || undefined,
      });
      if (res.success) {
        updateUser({
          name:   res.data.name,
          bio:    res.data.bio,
          mobile: res.data.mobile ?? undefined,
        });
        Toast.show({ type: 'success', text1: '✓ Profile saved', text2: 'Your details are updated' });
        setIsEditing(false);
      } else {
        Toast.show({ type: 'error', text1: res.error ?? 'Update failed' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Failed to save profile';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setSaving(false);
    }
  }

  // ── Logout ─────────────────────────────────────────────────────
  function handleLogout() {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) logout();
      return;
    }
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  }

  // ── Profile tab content ────────────────────────────────────────
  const ProfileTab = useCallback(() => (
    <Card>
      {/* Header row: title + Edit / Cancel button */}
      <View style={s.sectionHeaderRow}>
        <Text style={s.sectionTitle}>Profile Information</Text>
        {isEditing ? (
          <TouchableOpacity onPress={cancelEditing} style={s.cancelBtn}>
            <Text style={s.cancelBtnText}>✕ Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={startEditing} style={s.editBtn}>
            <Text style={s.editBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Full Name */}
      <View style={s.fieldBlock}>
        <Text style={s.fieldLabel}>FULL NAME</Text>
        {isEditing ? (
          <InputField
            value={draftName}
            onChangeText={setDraftName}
            placeholder="Your name"
          />
        ) : (
          <View style={s.readonlyField}>
            <Text style={s.readonlyText}>{user?.name || '—'}</Text>
          </View>
        )}
      </View>

      {/* Email – always read-only */}
      <View style={s.fieldBlock}>
        <Text style={s.fieldLabel}>EMAIL</Text>
        <View style={[s.readonlyField, s.readonlyDisabled]}>
          <Text style={[s.readonlyText, { color: colors.textMuted }]}>{user?.email || '—'}</Text>
        </View>
      </View>

      {/* Mobile */}
      <View style={s.fieldBlock}>
        <Text style={s.fieldLabel}>MOBILE</Text>
        {isEditing ? (
          <InputField
            value={draftMobile}
            onChangeText={setDraftMobile}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
          />
        ) : (
          <View style={s.readonlyField}>
            <Text style={s.readonlyText}>{user?.mobile || '—'}</Text>
          </View>
        )}
      </View>

      {/* Bio */}
      <View style={s.fieldBlock}>
        <Text style={s.fieldLabel}>BIO</Text>
        {isEditing ? (
          <InputField
            value={draftBio}
            onChangeText={setDraftBio}
            multiline
            placeholder="Tell your audience about yourself"
          />
        ) : (
          <View style={[s.readonlyField, { minHeight: 64 }]}>
            <Text style={[s.readonlyText, !user?.bio && { color: colors.textMuted }]}>
              {user?.bio || 'No bio added yet'}
            </Text>
          </View>
        )}
      </View>

      {/* Language – always read-only */}
      <View style={s.fieldBlock}>
        <Text style={s.fieldLabel}>LANGUAGE</Text>
        <View style={[s.readonlyField, s.readonlyDisabled]}>
          <Text style={[s.readonlyText, { color: colors.textMuted }]}>English</Text>
        </View>
      </View>

      {/* Save Changes – only shown in edit mode */}
      {isEditing && (
        <Button
          label={saving ? 'Saving…' : 'Save Changes'}
          onPress={saveProfile}
          loading={saving}
          style={{ marginTop: 8 }}
        />
      )}
    </Card>
  ), [isEditing, draftName, draftBio, draftMobile, user, saving, colors]);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

      {/* ── User header card ── */}
      <View style={s.userHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'P'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.userName}>{user?.name}</Text>
          <Text style={s.userEmail}>{user?.email}</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
            <Badge label={`${user?.plan ?? 'free'} plan`} variant="brand" />
            {user?.isVerified && <Badge label="✓ Verified" variant="success" />}
          </View>
        </View>
      </View>

      {/* ── Tab bar ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[s.tabBtn, tab === t.id && s.tabBtnActive]}>
            <Text style={s.tabEmoji}>{t.emoji}</Text>
            <Text style={[s.tabLabel, tab === t.id && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Tab content ── */}
      {tab === 'profile' && <ProfileTab />}

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
            { key: 'success',     label: 'Post published',      desc: 'When all platforms succeed' },
            { key: 'failed',      label: 'Post failed',         desc: 'When publishing fails' },
            { key: 'tokenExpiry', label: 'Token expiry',        desc: 'Before platform token expires' },
            { key: 'scheduled',   label: 'Scheduled reminder',  desc: '15 min before scheduled posts' },
            { key: 'weekly',      label: 'Weekly report',       desc: 'Analytics summary every Monday' },
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

      <Button label="Log Out" onPress={handleLogout} variant="danger" style={{ marginTop: 20 }} />
      <Text style={s.version}>OmniPost v1.0.0 · India 🇮🇳</Text>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const getStyles = (colors: typeof Colors) => StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg0 },
  content: { padding: Spacing.lg, paddingTop: 12 },

  // User header
  userHeader:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.bg2, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 },
  avatar:      { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.brand + '44', alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 22, fontWeight: '900', color: colors.brand },
  userName:    { fontSize: 16, fontWeight: '800', color: colors.text },
  userEmail:   { fontSize: 12, color: colors.textMuted },

  // Tabs
  tabRow:        { gap: 8, marginBottom: 16 },
  tabBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  tabBtnActive:  { backgroundColor: colors.brand, borderColor: colors.brand },
  tabEmoji:      { fontSize: 13 },
  tabLabel:      { fontSize: 12, color: colors.textSec, fontWeight: '600' },
  tabLabelActive:{ color: colors.white },

  // Profile tab
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle:     { fontSize: 15, fontWeight: '800', color: colors.text },
  sectionSub:       { fontSize: 12, color: colors.textMuted, marginBottom: 10, marginTop: -8 },

  editBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.brand + '18', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.brand + '44' },
  editBtnText:   { fontSize: 13, fontWeight: '700', color: colors.brand },
  cancelBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.danger + '18', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.danger + '44' },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: colors.danger },

  // Field display
  fieldBlock:      { marginBottom: 14 },
  fieldLabel:      { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8, marginBottom: 6 },
  readonlyField:   { backgroundColor: colors.bg3, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 13 },
  readonlyDisabled:{ backgroundColor: colors.bg0, opacity: 0.7 },
  readonlyText:    { fontSize: 14, color: colors.text, fontWeight: '500' },

  // Accounts
  accountRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  accountName:          { fontSize: 13, fontWeight: '700', color: colors.text },
  accountSub:           { fontSize: 11, color: colors.textMuted },
  reconnectBtn:         { backgroundColor: colors.brand, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  reconnectText:        { fontSize: 12, fontWeight: '700', color: colors.white },
  platformGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  platformCard:         { width: '30%', alignItems: 'center', padding: 12, backgroundColor: colors.bg3, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 5 },
  platformCardConnected:{ borderColor: colors.success + '44', backgroundColor: colors.successDim },
  platformName:         { fontSize: 11, fontWeight: '600', color: colors.text },
  platformStatus:       { fontSize: 11, fontWeight: '700' },

  // Notifications
  notifRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  notifLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  notifDesc:  { fontSize: 11, color: colors.textMuted, marginTop: 2 },

  // Security
  mfaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },

  // Billing
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planName:   { fontSize: 18, fontWeight: '900', color: colors.text },
  planPrice:  { fontSize: 22, fontWeight: '900', color: colors.brand },
  planPer:    { fontSize: 13, color: colors.textMuted, fontWeight: '400' },
  planRenew:  { fontSize: 12, color: colors.textMuted },
  paymentRow: { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border },
  paymentItem:{ fontSize: 13, color: colors.textSec },
  paymentNote:{ fontSize: 11, color: colors.textMuted, marginTop: 10 },
  invoiceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  invoiceDate:  { flex: 1, fontSize: 13, color: colors.textSec },
  invoiceAmount:{ fontSize: 13, fontWeight: '700', color: colors.text, marginRight: 10 },

  version: { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginTop: 16 },
});
