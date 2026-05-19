// src/screens/main/ComposeScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { Button, Card, PlatformIcon, Toggle, Badge } from '../../components/UI';
import { MOCK_ACCOUNTS, MOCK_HASHTAG_SETS } from '../../services/mockData';
import { PLATFORMS } from '../../constants/platforms';
import Toast from 'react-native-toast-message';

type PublishResult = { platform: string; status: 'success' | 'failed' };

export default function ComposeScreen({ navigation }: any) {
  const [text, setText]               = useState('');
  const [hashtags, setHashtags]       = useState<string[]>([]);
  const [tagInput, setTagInput]       = useState('');
  const [selected, setSelected]       = useState(['a1', 'a2', 'a3']);
  const [isScheduled, setScheduled]   = useState(false);
  const [schedDate, setSchedDate]     = useState('');
  const [schedTime, setSchedTime]     = useState('');
  const [customizing, setCustomizing] = useState(false);
  const [publishing, setPublishing]   = useState(false);
  const [results, setResults]         = useState<PublishResult[] | null>(null);
  const [showHSets, setShowHSets]     = useState(false);
  const [step, setStep]               = useState<'compose' | 'results'>('compose');

  const connected = MOCK_ACCOUNTS.filter(a => a.status === 'connected');
  const selObjs   = connected.filter(a => selected.includes(a.id));
  const fullText  = text + (hashtags.length ? '\n\n' + hashtags.map(t => `#${t}`).join(' ') : '');

  function toggleAccount(id: string) {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  function addTag(raw: string) {
    const clean = raw.replace(/^#/, '').trim().toLowerCase();
    if (clean && !hashtags.includes(clean)) setHashtags(p => [...p, clean]);
    setTagInput('');
  }

  function removeTag(t: string) {
    setHashtags(p => p.filter(x => x !== t));
  }

  async function handlePublish() {
    if (!text.trim() && hashtags.length === 0) {
      Alert.alert('Empty Post', 'Please write some content before posting.');
      return;
    }
    if (selected.length === 0) {
      Alert.alert('No Platform', 'Please select at least one platform.');
      return;
    }
    setPublishing(true);
    await new Promise(r => setTimeout(r, 2000));
    // In production: call postsApi.publish({ text, hashtags, targets: selObjs.map(...), scheduledAt })
    const res: PublishResult[] = selObjs.map(a => ({
      platform: a.platform,
      status: Math.random() > 0.12 ? 'success' : 'failed',
    }));
    setResults(res);
    setStep('results');
    setPublishing(false);
    const ok = res.filter(r => r.status === 'success').length;
    Toast.show({ type: ok === res.length ? 'success' : 'error', text1: ok === res.length ? `Published to ${ok} platforms! 🎉` : `Published to ${ok}/${res.length} platforms` });
  }

  function resetComposer() {
    setText(''); setHashtags([]); setSelected(['a1','a2','a3']);
    setResults(null); setStep('compose'); setScheduled(false);
    setSchedDate(''); setSchedTime('');
  }

  // Char counter for most restrictive selected platform
  const minLimit = selObjs.length > 0
    ? Math.min(...selObjs.map(a => PLATFORMS[a.platform as keyof typeof PLATFORMS]?.maxChars ?? 2200))
    : 2200;
  const charPct  = Math.min(100, (fullText.length / minLimit) * 100);
  const charColor = charPct > 100 ? Colors.danger : charPct > 80 ? Colors.warning : Colors.success;

  if (step === 'results' && results) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <Text style={styles.resultsTitle}>📊 Publishing Results</Text>
        {results.map(r => {
          const pl = PLATFORMS[r.platform as keyof typeof PLATFORMS];
          return (
            <View key={r.platform} style={[styles.resultCard, { borderColor: r.status === 'success' ? Colors.success + '44' : Colors.danger + '44', backgroundColor: r.status === 'success' ? Colors.successDim : Colors.dangerDim }]}>
              <PlatformIcon platformId={r.platform} size={28} />
              <Text style={[styles.resultPlatform, { color: r.status === 'success' ? Colors.success : Colors.danger }]}>{pl?.name}</Text>
              <Text style={{ fontSize: 18, marginLeft: 'auto' }}>{r.status === 'success' ? '✅' : '❌'}</Text>
            </View>
          );
        })}
        <View style={{ gap: 10, marginTop: 20 }}>
          <Button label="Create Another Post" onPress={resetComposer} />
          <Button label="Go to Dashboard" onPress={() => { resetComposer(); navigation.navigate('Dashboard'); }} variant="secondary" />
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Platform selector */}
        <Text style={styles.sectionLabel}>POST TO</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountRow}>
          {connected.map(acc => {
            const sel = selected.includes(acc.id);
            const pl  = PLATFORMS[acc.platform as keyof typeof PLATFORMS];
            return (
              <TouchableOpacity key={acc.id} onPress={() => toggleAccount(acc.id)}
                style={[styles.accountChip, sel && { borderColor: pl?.color ?? Colors.brand, backgroundColor: (pl?.color ?? Colors.brand) + '18' }]}>
                <PlatformIcon platformId={acc.platform} size={20} />
                <Text style={[styles.accountChipText, sel && { color: Colors.text }]}>{acc.username}</Text>
                {sel && <Text style={{ color: pl?.color ?? Colors.brand, fontSize: 12 }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Char limit warnings */}
        {selObjs.length > 0 && (
          <View style={styles.charRow}>
            {selObjs.map(a => {
              const lim = PLATFORMS[a.platform as keyof typeof PLATFORMS]?.maxChars ?? 2200;
              const over = fullText.length > lim;
              return (
                <View key={a.id} style={[styles.charChip, over && styles.charChipOver]}>
                  <PlatformIcon platformId={a.platform} size={14} />
                  <Text style={[styles.charText, { color: over ? Colors.danger : Colors.textMuted }]}>{fullText.length}/{lim}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Text area */}
        <Text style={styles.sectionLabel}>CAPTION</Text>
        <View style={styles.textAreaWrapper}>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            placeholder="What's on your mind? Share your story, idea or announcement..."
            placeholderTextColor={Colors.textMuted}
            style={styles.textArea}
          />
          {/* Char ring indicator */}
          <View style={styles.charIndicator}>
            <Text style={[styles.charCount, { color: charColor }]}>{fullText.length}</Text>
          </View>
        </View>

        {/* Hashtags */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>HASHTAGS</Text>
          <TouchableOpacity onPress={() => setShowHSets(!showHSets)}>
            <Text style={styles.savedSetsBtn}># Saved Sets</Text>
          </TouchableOpacity>
        </View>

        {showHSets && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hsetRow}>
            {MOCK_HASHTAG_SETS.map(hs => (
              <TouchableOpacity key={hs.id}
                onPress={() => setHashtags(prev => [...new Set([...prev, ...hs.tags])])}
                style={styles.hsetChip}>
                <Text style={styles.hsetText}>{hs.name} ({hs.tags.length})</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.tagsWrap}>
          {hashtags.map(t => (
            <TouchableOpacity key={t} onPress={() => removeTag(t)} style={styles.tag}>
              <Text style={styles.tagText}>#{t} ×</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tagInputRow}>
          <TextInput
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={() => addTag(tagInput)}
            placeholder="#hashtag (tap Enter to add)"
            placeholderTextColor={Colors.textMuted}
            style={styles.tagInput}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={() => addTag(tagInput)} style={styles.tagAddBtn}>
            <Text style={styles.tagAddText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Schedule for later</Text>
          <Toggle value={isScheduled} onChange={setScheduled} />
        </View>

        {isScheduled && (
          <View style={styles.schedRow}>
            <TextInput value={schedDate} onChangeText={setSchedDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} style={[styles.tagInput, { flex: 1 }]} />
            <TextInput value={schedTime} onChangeText={setSchedTime} placeholder="HH:MM" placeholderTextColor={Colors.textMuted} style={[styles.tagInput, { flex: 1 }]} />
          </View>
        )}

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Customize per platform</Text>
          <Toggle value={customizing} onChange={setCustomizing} />
        </View>

        {customizing && selObjs.map(acc => (
          <View key={acc.id} style={styles.customCard}>
            <View style={styles.customHeader}>
              <PlatformIcon platformId={acc.platform} size={22} />
              <Text style={styles.customTitle}>{acc.displayName}</Text>
              <Badge label={acc.username} />
            </View>
            <TextInput
              defaultValue={text}
              multiline
              placeholder={`Custom caption for ${PLATFORMS[acc.platform as keyof typeof PLATFORMS]?.name}...`}
              placeholderTextColor={Colors.textMuted}
              style={[styles.textArea, { minHeight: 70 }]}
            />
          </View>
        ))}

        {/* Action */}
        <View style={styles.actionRow}>
          <Text style={styles.selectedCount}>{selected.length} platform{selected.length !== 1 ? 's' : ''}</Text>
          {publishing
            ? <View style={styles.publishingBox}><ActivityIndicator color={Colors.brand} /><Text style={styles.publishingText}>Publishing...</Text></View>
            : (
              <TouchableOpacity
                onPress={handlePublish}
                disabled={!text.trim() || selected.length === 0}
                style={[styles.publishBtn, (!text.trim() || selected.length === 0) && { opacity: 0.5 }]}>
                <Text style={styles.publishBtnText}>{isScheduled ? '🕐 Schedule Post' : '🚀 Post Now'}</Text>
              </TouchableOpacity>
            )
          }
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg0 },
  content: { padding: Spacing.lg },

  sectionLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  sectionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },

  accountRow: { gap: 8, paddingBottom: 4 },
  accountChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: Colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  accountChipText: { fontSize: 11, color: Colors.textSec, fontWeight: '500' },

  charRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  charChip:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.bg2, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  charChipOver: { borderColor: Colors.danger + '66', backgroundColor: Colors.dangerDim },
  charText:   { fontSize: 10 },

  textAreaWrapper: { position: 'relative' },
  textArea:   { backgroundColor: Colors.bg2, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, color: Colors.text, fontSize: 14, minHeight: 120, lineHeight: 22, textAlignVertical: 'top' },
  charIndicator: { position: 'absolute', bottom: 10, right: 10, backgroundColor: Colors.bg3, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  charCount:  { fontSize: 10, fontWeight: '700' },

  savedSetsBtn: { fontSize: 12, color: Colors.brand, fontWeight: '600' },
  hsetRow:  { gap: 8, paddingBottom: 8 },
  hsetChip: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  hsetText: { fontSize: 12, color: Colors.textSec },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: Colors.brandDim, borderRadius: 20, borderWidth: 1, borderColor: Colors.brandBdr },
  tagText:  { fontSize: 12, color: Colors.brand, fontWeight: '600' },
  tagInputRow: { flexDirection: 'row', gap: 8 },
  tagInput: { flex: 1, backgroundColor: Colors.bg2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text, fontSize: 13 },
  tagAddBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.bg3, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center' },
  tagAddText:{ fontSize: 13, color: Colors.textSec, fontWeight: '600' },

  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  optionLabel:{ fontSize: 14, color: Colors.textSec },
  schedRow:  { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 4 },

  customCard:  { backgroundColor: Colors.bg2, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, marginTop: 10 },
  customHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  customTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text },

  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  selectedCount: { fontSize: 12, color: Colors.textMuted },
  publishBtn:   { backgroundColor: Colors.brand, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 13 },
  publishBtnText:{ fontSize: 14, fontWeight: '800', color: Colors.white },
  publishingBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  publishingText:{ fontSize: 13, color: Colors.textSec },

  resultsTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginBottom: 20, textAlign: 'center' },
  resultCard:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  resultPlatform:{ flex: 1, fontSize: 14, fontWeight: '700' },
});
