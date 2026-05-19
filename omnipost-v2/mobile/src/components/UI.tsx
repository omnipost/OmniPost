// src/components/UI.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  StyleProp, ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../constants/theme';
import { PLATFORMS } from '../constants/platforms';

/* ── PrimaryButton ───────────────────────────────────────────── */
interface BtnProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}
export function Button({ label, onPress, loading, disabled, variant = 'primary', style, icon }: BtnProps) {
  const bg = {
    primary:   Colors.brand,
    secondary: Colors.bg3,
    ghost:     'transparent',
    danger:    Colors.dangerDim,
  }[variant];
  const textColor = {
    primary:   Colors.white,
    secondary: Colors.text,
    ghost:     Colors.textSec,
    danger:    Colors.danger,
  }[variant];
  const bdr = variant === 'secondary' ? Colors.border : variant === 'danger' ? Colors.danger + '44' : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.btn, { backgroundColor: bg, borderColor: bdr, borderWidth: variant !== 'primary' ? 1 : 0, opacity: disabled ? 0.5 : 1 }, style]}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <>
            {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
            <Text style={[styles.btnText, { color: textColor }]}>{label}</Text>
          </>
      }
    </TouchableOpacity>
  );
}

/* ── Card ────────────────────────────────────────────────────── */
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>{children}</View>
  );
}

/* ── Badge ───────────────────────────────────────────────────── */
type BadgeVariant = 'success' | 'warning' | 'danger' | 'brand' | 'info' | 'default';
export function Badge({ label, variant = 'default' }: { label: string; variant?: BadgeVariant }) {
  const map: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    success: { bg: Colors.successDim, color: Colors.success, border: Colors.success + '44' },
    warning: { bg: Colors.warningDim, color: Colors.warning, border: Colors.warning + '44' },
    danger:  { bg: Colors.dangerDim,  color: Colors.danger,  border: Colors.danger  + '44' },
    brand:   { bg: Colors.brandDim,   color: Colors.brand,   border: Colors.brandBdr       },
    info:    { bg: Colors.cyanDim,    color: Colors.cyan,    border: Colors.cyan    + '44' },
    default: { bg: Colors.bg3,        color: Colors.textSec, border: Colors.border         },
  };
  const s = map[variant];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{label}</Text>
    </View>
  );
}

/* ── Platform Icon ───────────────────────────────────────────── */
export function PlatformIcon({ platformId, size = 28 }: { platformId: string; size?: number }) {
  const p = PLATFORMS[platformId as keyof typeof PLATFORMS];
  if (!p) return null;
  return (
    <View style={{
      width: size, height: size,
      borderRadius: size * 0.3,
      backgroundColor: p.color + '22',
      borderWidth: 1, borderColor: p.color + '44',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: p.color, fontSize: size * 0.38, fontWeight: '800' }}>{p.abbr}</Text>
    </View>
  );
}

/* ── StatCard ────────────────────────────────────────────────── */
export function StatCard({ label, value, delta, iconColor }: { label: string; value: string; delta?: number; iconColor?: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {delta !== undefined && (
        <Text style={[styles.statDelta, { color: delta >= 0 ? Colors.success : Colors.danger }]}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs last month
        </Text>
      )}
    </Card>
  );
}

/* ── SectionTitle ────────────────────────────────────────────── */
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ── Divider ─────────────────────────────────────────────────── */
export function Divider() {
  return <View style={styles.divider} />;
}

/* ── Toggle ──────────────────────────────────────────────────── */
import { Animated } from 'react-native';
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value]);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 18] });
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
      style={[styles.toggle, { backgroundColor: value ? Colors.brand : Colors.border }]}
    >
      <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
}

/* ── InputField ──────────────────────────────────────────────── */
import { TextInput, TextInputProps } from 'react-native';
export function InputField(props: TextInputProps & { label?: string; error?: string }) {
  const { label, error, style, ...rest } = props;
  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.textMuted}
        {...rest}
      />
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
}

/* ── EmptyState ──────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }: { icon?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.emptyState}>
      {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDesc}>{description}</Text>}
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, paddingVertical: 13, borderRadius: Radius.md,
  },
  btnText: { fontSize: 14, fontWeight: '700' },

  card: {
    backgroundColor: Colors.bg2, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg,
  },

  badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '600' },

  statCard: { padding: 16 },
  statLabel: { fontSize: 11, color: Colors.textSec, fontWeight: '500', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  statDelta: { fontSize: 12, marginTop: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 15, fontWeight: '800', color: Colors.text },
  sectionAction: { fontSize: 12, color: Colors.brand, fontWeight: '600' },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },

  toggle: { width: 40, height: 22, borderRadius: 11, justifyContent: 'center' },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 },

  inputWrapper: { marginBottom: 14 },
  inputLabel:   { fontSize: 11, fontWeight: '700', color: Colors.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    backgroundColor: Colors.bg1, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12, color: Colors.text, fontSize: 14,
  },
  inputError: { fontSize: 11, color: Colors.danger, marginTop: 4 },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon:  { fontSize: 40, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  emptyDesc:  { fontSize: 13, color: Colors.textSec, textAlign: 'center', lineHeight: 20, paddingHorizontal: 32 },
  emptyAction:{ marginTop: 16 },
});
