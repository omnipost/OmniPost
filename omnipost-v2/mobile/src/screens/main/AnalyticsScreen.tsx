// src/screens/main/AnalyticsScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Card, StatCard, SectionTitle, Badge, PlatformIcon } from '../../components/UI';
import { MOCK_ANALYTICS, MOCK_POSTS } from '../../services/mockData';
import { PLATFORMS } from '../../constants/platforms';

const RANGES = ['7 days', '14 days', '30 days', '90 days'];

export default function AnalyticsScreen() {
  const [range, setRange] = useState('30 days');

  const totalLikes    = MOCK_ANALYTICS.platforms.reduce((s, p) => s + p.likes, 0);
  const totalComments = MOCK_ANALYTICS.platforms.reduce((s, p) => s + p.comments, 0);
  const totalShares   = MOCK_ANALYTICS.platforms.reduce((s, p) => s + p.shares, 0);

  const published = MOCK_POSTS.filter(p => p.status === 'published');

  function fmtNum(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('en-IN');
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Range selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rangeRow}>
        {RANGES.map(r => (
          <TouchableOpacity key={r} onPress={() => setRange(r)} style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}>
            <Text style={[styles.rangeTxt, range === r && styles.rangeTxtActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary stats */}
      <View style={styles.statsGrid}>
        <StatCard label="Impressions" value={fmtNum(MOCK_ANALYTICS.totalImpressions)} delta={18} />
        <StatCard label="Total Reach"  value={fmtNum(MOCK_ANALYTICS.totalReach)}       delta={12} />
        <StatCard label="Engagement"   value={fmtNum(MOCK_ANALYTICS.totalEngagement)}  delta={24} />
        <StatCard label="Avg Eng. Rate" value={`${MOCK_ANALYTICS.avgEngagementRate}%`} delta={3} />
      </View>

      {/* Engagement breakdown */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Engagement Breakdown" />
        <View style={styles.engRow}>
          {[
            { label: 'Likes',    value: fmtNum(totalLikes),    color: Colors.danger,  emoji: '❤️' },
            { label: 'Comments', value: fmtNum(totalComments), color: Colors.brand,   emoji: '💬' },
            { label: 'Shares',   value: fmtNum(totalShares),   color: Colors.success, emoji: '↗️' },
          ].map(item => (
            <View key={item.label} style={styles.engCard}>
              <Text style={styles.engEmoji}>{item.emoji}</Text>
              <Text style={[styles.engValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.engLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Platform Performance Table */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Platform Performance" />
        {MOCK_ANALYTICS.platforms.map((p, i) => {
          const pl = PLATFORMS[p.platform as keyof typeof PLATFORMS];
          const maxReach = Math.max(...MOCK_ANALYTICS.platforms.map(x => x.reach));
          const pct = (p.reach / maxReach) * 100;
          const engColor = p.engagementRate >= 7 ? Colors.success : p.engagementRate >= 5 ? Colors.warning : Colors.textSec;
          return (
            <View key={p.platform} style={[styles.platformRow, i < MOCK_ANALYTICS.platforms.length - 1 && styles.platformRowBorder]}>
              <PlatformIcon platformId={p.platform} size={30} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={styles.platformMeta}>
                  <Text style={styles.platformName}>{pl?.name}</Text>
                  <Text style={[styles.engRate, { color: engColor }]}>{p.engagementRate}%</Text>
                </View>
                <View style={styles.reachBar}>
                  <View style={[styles.reachFill, { width: `${pct}%` as any, backgroundColor: pl?.color }]} />
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statItem}>👁️ {fmtNum(p.reach)}</Text>
                  <Text style={styles.statItem}>❤️ {fmtNum(p.likes)}</Text>
                  <Text style={styles.statItem}>💬 {fmtNum(p.comments)}</Text>
                  <Text style={[styles.statItem, { color: Colors.success }]}>+{fmtNum(p.followersGrowth)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Card>

      {/* Top posts */}
      <SectionTitle title="Top Performing Posts" />
      {published.map(post => {
        const totalReach = post.targets.reduce((s, t) => s + (t.reach ?? 0), 0);
        const totalLikes = post.targets.reduce((s, t) => s + (t.likes ?? 0), 0);
        return (
          <Card key={post.id} style={{ marginBottom: 10 }}>
            <Text style={styles.postText} numberOfLines={2}>{post.text}</Text>
            <View style={styles.postPlatforms}>
              {post.targets.map(t => <PlatformIcon key={t.id} platformId={t.platform} size={20} />)}
            </View>
            <View style={styles.postMetrics}>
              <View style={styles.metric}>
                <Text style={styles.metricVal}>{fmtNum(totalReach)}</Text>
                <Text style={styles.metricLbl}>Reach</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricVal}>{fmtNum(totalLikes)}</Text>
                <Text style={styles.metricLbl}>Likes</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricVal}>{post.targets.reduce((s, t) => s + (t.comments ?? 0), 0)}</Text>
                <Text style={styles.metricLbl}>Comments</Text>
              </View>
              {post.targets[0]?.status && (
                <Badge label={post.targets.every(t => t.status === 'success') ? 'All OK' : 'Partial'} variant={post.targets.every(t => t.status === 'success') ? 'success' : 'warning'} />
              )}
            </View>
          </Card>
        );
      })}

      {/* Best post times */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Best Times to Post" />
        {[
          { platform: 'instagram', day: 'Wednesday', time: '9:00 AM' },
          { platform: 'twitter',   day: 'Tuesday',   time: '12:00 PM' },
          { platform: 'linkedin',  day: 'Tuesday',   time: '10:00 AM' },
          { platform: 'youtube',   day: 'Saturday',  time: '2:00 PM' },
        ].map(bt => (
          <View key={bt.platform} style={styles.bestTimeRow}>
            <PlatformIcon platformId={bt.platform} size={28} />
            <Text style={styles.bestDay}>{bt.day}</Text>
            <Badge label={bt.time} variant="info" />
          </View>
        ))}
      </Card>

      {/* Top hashtags */}
      <Card style={{ marginBottom: 32 }}>
        <SectionTitle title="Top Hashtags" />
        {[
          { tag: '#indianinfluencer', reach: 180000, posts: 12 },
          { tag: '#lifestyle',        reach: 156000, posts: 18 },
          { tag: '#morningroutine',   reach: 124000, posts: 8  },
          { tag: '#ootd',             reach: 112000, posts: 14 },
          { tag: '#selfcare',         reach: 98000,  posts: 10 },
        ].map((ht, i) => (
          <View key={ht.tag} style={[styles.hashRow, i < 4 && styles.hashRowBorder]}>
            <Text style={styles.hashRank}>{i + 1}</Text>
            <Text style={styles.hashTag}>{ht.tag}</Text>
            <Text style={styles.hashStats}>{ht.posts} posts · {fmtNum(ht.reach)} reach</Text>
          </View>
        ))}
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg0 },
  content: { padding: Spacing.lg, paddingTop: 8 },

  rangeRow:   { gap: 8, marginBottom: 16 },
  rangeBtn:   { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  rangeBtnActive:{ backgroundColor: Colors.brand, borderColor: Colors.brand },
  rangeTxt:   { fontSize: 12, color: Colors.textSec, fontWeight: '600' },
  rangeTxtActive:{ color: Colors.white },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },

  engRow:  { flexDirection: 'row', gap: 10 },
  engCard: { flex: 1, backgroundColor: Colors.bg3, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 },
  engEmoji:{ fontSize: 22 },
  engValue:{ fontSize: 18, fontWeight: '800' },
  engLabel:{ fontSize: 11, color: Colors.textMuted },

  platformRow:   { paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  platformRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  platformMeta:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  platformName:  { fontSize: 13, fontWeight: '700', color: Colors.text },
  engRate:       { fontSize: 13, fontWeight: '700' },
  reachBar:      { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  reachFill:     { height: '100%', borderRadius: 3 },
  statsRow:      { flexDirection: 'row', gap: 10 },
  statItem:      { fontSize: 11, color: Colors.textMuted },

  postText:      { fontSize: 13, color: Colors.textSec, lineHeight: 20, marginBottom: 10 },
  postPlatforms: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  postMetrics:   { flexDirection: 'row', gap: 16, alignItems: 'center' },
  metric:        { alignItems: 'center' },
  metricVal:     { fontSize: 16, fontWeight: '800', color: Colors.text },
  metricLbl:     { fontSize: 10, color: Colors.textMuted },

  bestTimeRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  bestDay:       { flex: 1, fontSize: 13, color: Colors.textSec, fontWeight: '500' },

  hashRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  hashRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  hashRank:      { width: 20, fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  hashTag:       { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.text },
  hashStats:     { fontSize: 11, color: Colors.textMuted },
});
