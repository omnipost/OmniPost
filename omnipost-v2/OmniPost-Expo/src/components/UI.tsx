// src/components/UI.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated, TextInput, TextInputProps,
  StyleProp, ViewStyle, TextStyle,
} from 'react-native';
import { Colors, Spacing, Radius, Typography, useTheme } from '../constants/theme';
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
  const { colors } = useTheme();
  const bg = {
    primary:   colors.brand,
    secondary: colors.bg3,
    ghost:     'transparent',
    danger:    colors.dangerDim,
  }[variant];
  const textColor = {
    primary:   colors.white,
    secondary: colors.text,
    ghost:     colors.textSec,
    danger:    colors.danger,
  }[variant];
  const bdr = variant === 'secondary' ? colors.border : variant === 'danger' ? colors.danger + '44' : 'transparent';

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
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.bg2, borderColor: colors.border }, style]}>{children}</View>
  );
}

/* ── Badge ───────────────────────────────────────────────────── */
type BadgeVariant = 'success' | 'warning' | 'danger' | 'brand' | 'info' | 'default';
export function Badge({ label, variant = 'default' }: { label: string; variant?: BadgeVariant }) {
  const { colors } = useTheme();
  const map: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
    success: { bg: colors.successDim, color: colors.success, border: colors.success + '44' },
    warning: { bg: colors.warningDim, color: colors.warning, border: colors.warning + '44' },
    danger:  { bg: colors.dangerDim,  color: colors.danger,  border: colors.danger  + '44' },
    brand:   { bg: colors.brandDim,   color: colors.brand,   border: colors.brandBdr       },
    info:    { bg: colors.cyanDim,    color: colors.cyan,    border: colors.cyan    + '44' },
    default: { bg: colors.bg3,        color: colors.textSec, border: colors.border         },
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
export function StatCard({ label, value, delta }: { label: string; value: string; delta?: number; iconColor?: string }) {
  const { colors } = useTheme();
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statLabel, { color: colors.textSec }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      {delta !== undefined && (
        <Text style={[styles.statDelta, { color: delta >= 0 ? colors.success : colors.danger }]}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% vs last month
        </Text>
      )}
    </Card>
  );
}

/* ── SectionTitle ────────────────────────────────────────────── */
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.brand }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ── Divider ─────────────────────────────────────────────────── */
export function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

/* ── Toggle ──────────────────────────────────────────────────── */
export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value]);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 18] });
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
      style={[styles.toggle, { backgroundColor: value ? colors.brand : colors.border }]}
    >
      <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
}

/* ── InputField ──────────────────────────────────────────────── */
export function InputField(props: TextInputProps & { label?: string; error?: string; containerStyle?: StyleProp<ViewStyle> }) {
  const { label, error, style, containerStyle, ...rest } = props;
  const { colors } = useTheme();
  return (
    <View style={[styles.inputWrapper, containerStyle]}>
      {label && <Text style={[styles.inputLabel, { color: colors.textSec }]}>{label}</Text>}
      <TextInput
        style={[styles.input, { backgroundColor: colors.bg1, color: colors.text, borderColor: colors.border }, style]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
      {error && <Text style={[styles.inputError, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

/* ── EmptyState ──────────────────────────────────────────────── */
export function EmptyState({ icon, title, description, action }: { icon?: string; title: string; description?: string; action?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyState}>
      {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {description && <Text style={[styles.emptyDesc, { color: colors.textSec }]}>{description}</Text>}
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

/* ── Skeleton Loading ────────────────────────────────────────── */
interface SkeletonProps {
  width?: any;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height, borderRadius = Radius.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const anim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.bg3,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, paddingVertical: 13, borderRadius: Radius.md,
  },
  btnText: { fontSize: 14, fontWeight: '700' },

  card: {
    borderRadius: Radius.lg,
    borderWidth: 1, padding: Spacing.lg,
  },

  badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, fontWeight: '600' },

  statCard:  { padding: 16 },
  statLabel: { fontSize: 11, fontWeight: '500', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  statDelta: { fontSize: 12, marginTop: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 15, fontWeight: '800' },
  sectionAction: { fontSize: 12, fontWeight: '600' },

  divider: { height: 1, marginVertical: 12 },

  toggle:      { width: 40, height: 22, borderRadius: 11, justifyContent: 'center' },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 },

  inputWrapper: { marginBottom: 14 },
  inputLabel:   { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: {
    borderRadius: Radius.md, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  inputError: { fontSize: 11, marginTop: 4 },

  emptyState:  { alignItems: 'center', paddingVertical: 48 },
  emptyIcon:   { fontSize: 40, marginBottom: 14 },
  emptyTitle:  { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  emptyDesc:   { fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 32 },
  emptyAction: { marginTop: 16 },
});
