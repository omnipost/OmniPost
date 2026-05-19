// src/screens/main/MediaScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, FlatList,
} from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Card, Button, Badge, EmptyState } from '../../components/UI';
import { MOCK_MEDIA } from '../../services/mockData';
import { fmtBytes } from '../../../src/utils';
import Toast from 'react-native-toast-message';
import type { MediaAsset } from '../../types';

type FilterType = 'all' | 'image' | 'video' | 'audio';

function fmtSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return (bytes / 1_000_000_000).toFixed(1) + ' GB';
  if (bytes >= 1_000_000)     return (bytes / 1_000_000).toFixed(1) + ' MB';
  if (bytes >= 1_000)         return (bytes / 1_000).toFixed(0) + ' KB';
  return bytes + ' B';
}

export default function MediaScreen() {
  const [filter, setFilter]   = useState<FilterType>('all');
  const [view, setView]       = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<string[]>([]);

  const totalBytes = MOCK_MEDIA.reduce((s, m) => s + m.size, 0);
  const usedMb     = totalBytes / 1_000_000;
  const limitMb    = 5120; // 5 GB Creator plan
  const usedPct    = (usedMb / limitMb) * 100;

  const filtered = MOCK_MEDIA.filter(m =>
    filter === 'all' || m.type === filter
  );

  function toggleSelect(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function handleDeleteSelected() {
    Alert.alert(
      'Delete Files',
      `Delete ${selected.length} file${selected.length > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: () => {
            setSelected([]);
            Toast.show({ type: 'success', text1: `${selected.length} files deleted` });
          },
        },
      ]
    );
  }

  function handleUpload() {
    // In production: use react-native-image-crop-picker or react-native-document-picker
    Toast.show({ type: 'info', text1: 'Opening file picker…' });
  }

  const renderGridItem = ({ item: asset }: { item: MediaAsset }) => {
    const isSel = selected.includes(asset.id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(asset.id)}
        onLongPress={() => toggleSelect(asset.id)}
        activeOpacity={0.85}
        style={[styles.gridItem, isSel && styles.gridItemSelected]}
      >
        <Image
          source={{ uri: asset.thumbUrl ?? asset.url }}
          style={styles.gridThumb}
        />
        {asset.type === 'video' && (
          <View style={styles.videoOverlay}>
            <Text style={styles.videoIcon}>▶</Text>
            {asset.duration && (
              <Text style={styles.videoDuration}>
                {Math.floor(asset.duration / 60)}:{String(asset.duration % 60).padStart(2, '0')}
              </Text>
            )}
          </View>
        )}
        {isSel && (
          <View style={styles.checkOverlay}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item: asset, index }: { item: MediaAsset; index: number }) => (
    <View style={[styles.listRow, index < filtered.length - 1 && styles.listRowBorder]}>
      <Image
        source={{ uri: asset.thumbUrl ?? asset.url }}
        style={styles.listThumb}
      />
      <View style={styles.listMeta}>
        <Text style={styles.listName} numberOfLines={1}>{asset.filename}</Text>
        <Text style={styles.listSub}>{fmtSize(asset.size)} · {asset.type}</Text>
        {asset.width && asset.height && (
          <Text style={styles.listDim}>{asset.width} × {asset.height}px</Text>
        )}
      </View>
      <Badge
        label={asset.type}
        variant={asset.type === 'video' ? 'info' : asset.type === 'audio' ? 'brand' : 'default'}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Header actions */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {MOCK_MEDIA.length} files · {fmtSize(totalBytes)}
        </Text>
        <View style={styles.headerActions}>
          {selected.length > 0 && (
            <TouchableOpacity onPress={handleDeleteSelected} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>🗑 Delete ({selected.length})</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleUpload} style={styles.uploadBtn}>
            <Text style={styles.uploadBtnText}>⬆ Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Storage bar */}
          <Card style={{ marginBottom: 14 }}>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Storage used</Text>
              <Text style={styles.storageValue}>
                {fmtSize(totalBytes)} / {(limitMb / 1024).toFixed(0)} GB
              </Text>
            </View>
            <View style={styles.storageBar}>
              <View style={[styles.storageFill, { width: `${Math.min(100, usedPct)}%` as any }]} />
            </View>
            <Text style={styles.storagePlan}>Creator plan · 5 GB included</Text>
          </Card>

          {/* Filter + View toggle */}
          <View style={styles.toolbar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {(['all', 'image', 'video', 'audio'] as FilterType[]).map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.viewToggle}>
              {[['grid', '⊞'], ['list', '☰']].map(([v, icon]) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setView(v as 'grid' | 'list')}
                  style={[styles.viewBtn, view === v && styles.viewBtnActive]}
                >
                  <Text style={[styles.viewIcon, view === v && styles.viewIconActive]}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upload drop zone */}
          <TouchableOpacity onPress={handleUpload} style={styles.dropZone}>
            <Text style={styles.dropIcon}>⬆️</Text>
            <Text style={styles.dropTitle}>Tap to upload files</Text>
            <Text style={styles.dropSub}>Images, videos, audio · Up to 500 MB</Text>
          </TouchableOpacity>

          {/* Media content */}
          {filtered.length === 0 ? (
            <EmptyState
              icon="📁"
              title="No media found"
              description="Upload your first image, video or audio file."
              action={<Button label="Upload Media" onPress={handleUpload} style={{ marginTop: 4 }} />}
            />
          ) : view === 'grid' ? (
            <FlatList
              data={filtered}
              renderItem={renderGridItem}
              keyExtractor={item => item.id}
              numColumns={3}
              columnWrapperStyle={styles.gridRow}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 6 }}
            />
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <FlatList
                data={filtered}
                renderItem={renderListItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </Card>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg0 },
  content: { padding: Spacing.lg, paddingTop: 8 },

  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, paddingBottom: 8 },
  headerTitle:   { fontSize: 13, color: Colors.textSec },
  headerActions: { flexDirection: 'row', gap: 8 },
  deleteBtn:     { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.dangerDim, borderRadius: 10, borderWidth: 1, borderColor: Colors.danger + '44' },
  deleteBtnText: { fontSize: 12, color: Colors.danger, fontWeight: '700' },
  uploadBtn:     { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.brand, borderRadius: 10 },
  uploadBtnText: { fontSize: 12, color: Colors.white, fontWeight: '700' },

  storageRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  storageLabel: { fontSize: 12, color: Colors.textSec },
  storageValue: { fontSize: 12, color: Colors.textSec },
  storageBar:   { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  storageFill:  { height: '100%', backgroundColor: Colors.brand, borderRadius: 3 },
  storagePlan:  { fontSize: 11, color: Colors.textMuted },

  toolbar:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  filterRow:  { gap: 7, flex: 1 },
  filterBtn:  { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  filterText: { fontSize: 12, color: Colors.textSec, fontWeight: '600' },
  filterTextActive: { color: Colors.white },
  viewToggle: { flexDirection: 'row', backgroundColor: Colors.bg2, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 3, gap: 2 },
  viewBtn:    { padding: 6, borderRadius: 7 },
  viewBtnActive: { backgroundColor: Colors.bg3 },
  viewIcon:   { fontSize: 16, color: Colors.textMuted },
  viewIconActive: { color: Colors.text },

  dropZone:  { borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, borderRadius: 16, padding: 28, alignItems: 'center', marginBottom: 16 },
  dropIcon:  { fontSize: 30, marginBottom: 8 },
  dropTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSec, marginBottom: 4 },
  dropSub:   { fontSize: 12, color: Colors.textMuted },

  gridRow:      { gap: 6, marginBottom: 6 },
  gridItem:     { flex: 1, aspectRatio: 1, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, maxWidth: '32%' },
  gridItemSelected: { borderColor: Colors.brand, borderWidth: 2 },
  gridThumb:    { width: '100%', height: '100%' },
  videoOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  videoIcon:    { fontSize: 18, color: Colors.white },
  videoDuration:{ fontSize: 10, color: Colors.white, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  checkOverlay: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  checkIcon:    { fontSize: 12, color: Colors.white, fontWeight: '800' },

  listRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  listThumb:     { width: 48, height: 40, borderRadius: 8 },
  listMeta:      { flex: 1 },
  listName:      { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  listSub:       { fontSize: 11, color: Colors.textMuted },
  listDim:       { fontSize: 10, color: Colors.textMuted },
});
