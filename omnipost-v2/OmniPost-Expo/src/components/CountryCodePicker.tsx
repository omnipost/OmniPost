import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Colors, Radius, Spacing, useTheme } from '../constants/theme';
import { CountryOption, COUNTRIES } from '../constants/countries';

interface PickerProps {
  value: CountryOption;
  onSelect: (country: CountryOption) => void;
}

export function CountryCodePicker({ value, onSelect }: PickerProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return COUNTRIES;
    return COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(query)
      || country.dialCode.includes(query)
      || country.iso2.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: colors.bg1, borderColor: colors.border }]}
      >
        <Text style={[styles.triggerText, { color: colors.text }]}>{value.flag} {value.dialCode}</Text>
        <Text style={[styles.triggerLabel, { color: colors.textSec }]}>{value.name}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.bg0, borderColor: colors.border }]}> 
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select country</Text>
              <TouchableOpacity onPress={() => { setOpen(false); setSearch(''); }} style={styles.closeBtn}>
                <Text style={[styles.closeText, { color: colors.textSec }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search country or code"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { backgroundColor: colors.bg1, borderColor: colors.border, color: colors.text }]}
              keyboardType={Platform.OS === 'ios' ? 'web-search' : 'default'}
              returnKeyType="search"
            />
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator>
              {filteredCountries.map((country) => (
                <TouchableOpacity
                  key={country.iso2}
                  activeOpacity={0.7}
                  style={[styles.countryRow, country.iso2 === value.iso2 && { backgroundColor: colors.brandDim }]}
                  onPress={() => {
                    onSelect(country);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <View>
                    <Text style={[styles.countryName, { color: colors.text }]}>{country.flag} {country.name}</Text>
                    <Text style={[styles.countryMeta, { color: colors.textSec }]}>{country.iso2.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.countryCode, { color: colors.text }]}>{country.dialCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    minWidth: 108,
    height: 48,
  },
  triggerText: { fontSize: 14, fontWeight: '700' },
  triggerLabel: { fontSize: 12, marginTop: 2 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modal: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  closeBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  closeText: { fontSize: 13, fontWeight: '700' },
  searchInput: {
    borderRadius: Radius.md,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  countryName: { fontSize: 14, fontWeight: '600' },
  countryMeta: { fontSize: 11, marginTop: 2 },
  countryCode: { fontSize: 14, fontWeight: '700' },
});
