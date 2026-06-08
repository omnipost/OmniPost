import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Image, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radius, useTheme } from '../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentWidth = Math.min(width - Spacing.xl * 2, 440);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bg0 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { width: contentWidth, alignSelf: 'center' }]}>
          <View style={styles.header}>
            <View style={[styles.logoWrap, { backgroundColor: colors.brandDim, borderColor: colors.brandBdr }]}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.brand, { color: colors.text }]}>OmniPost</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSec }]}>{subtitle}</Text>
          ) : null}

          <View style={[styles.form, { backgroundColor: colors.bg1, borderColor: colors.border }]}>
            {children}
          </View>

          {footer}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center' },
  card: { width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoWrap: {
    width: 48, height: 48, borderRadius: 14,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  logo: { width: 32, height: 32, borderRadius: 8 },
  brand: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  form: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 4,
  },
});
