import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing, useTheme } from '../constants/theme';
import { useWindowDimensions } from 'react-native';
import { useSearchStore } from '../store/searchStore';

interface AppHeaderProps {
  activeTab: string;
}

export default function AppHeader({ activeTab }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors, isDarkMode, toggleTheme } = useTheme();
  
  const query = useSearchStore((state) => state.queries[activeTab] || '');
  const setQuery = useSearchStore((state) => state.setQuery);
  const clearQuery = useSearchStore((state) => state.clearQuery);

  const { width } = useWindowDimensions();
  const isMobile = width < 480;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.bg1,
        borderBottomColor: colors.border,
        paddingTop: Math.max(insets.top, 24) + 10,
        paddingBottom: 12,
      },
    ]}>
      <View style={styles.brandRow}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>

      <View style={[
        styles.searchContainer,
        {
          backgroundColor: colors.bg0,
          borderColor: colors.border,
        }
      ]}>
        <TextInput
          value={query}
          onChangeText={(text) => setQuery(activeTab, text)}
          placeholder="Search"
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => clearQuery(activeTab)} style={styles.clearButton} activeOpacity={0.7}>
            <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.actions}>
        {/* <TouchableOpacity onPress={() => navigation.navigate('Compose')} activeOpacity={0.8} style={[styles.newBtn, { backgroundColor: colors.brand }]}>
          <Text style={styles.newBtnText}>+ New Post</Text>
        </TouchableOpacity> */}
        {!isMobile && (
         <TouchableOpacity onPress={() => navigation.navigate('Compose')} activeOpacity={0.8} style={[styles.newBtn, { backgroundColor: colors.brand }]}>
          <Text>+ New Post</Text>
        </TouchableOpacity>)}
        
        
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

  searchContainer: {
    flex: 1,
    minWidth: 140,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    paddingHorizontal: 6,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
