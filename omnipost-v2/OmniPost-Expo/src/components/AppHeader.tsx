import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing, useTheme } from '../constants/theme';

export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.bg1,
        borderBottomColor: colors.border,
        paddingTop: insets.top + 10,
        paddingBottom: 12,
      },
    ]}>
      <View style={styles.brandRow}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search"
        placeholderTextColor={colors.textMuted}
        style={[styles.searchInput, { backgroundColor: colors.bg0, borderColor: colors.border, color: colors.text }]}
        returnKeyType="search"
      />

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('Compose')} activeOpacity={0.8} style={[styles.newBtn, { backgroundColor: colors.brand }]}>
          <Text style={styles.newBtnText}>+ New Post</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8} style={[styles.themeBtn, { borderColor: colors.border, backgroundColor: isDarkMode ? colors.bg2 : colors.bg0 }]}>
          <Text style={{ fontSize: 18 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },

  searchInput: {
    flex: 1,
    minWidth: 140,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  newBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  newBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  themeBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
