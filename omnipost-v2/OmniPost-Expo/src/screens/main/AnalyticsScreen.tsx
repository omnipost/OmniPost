// src/screens/main/AnalyticsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, useTheme } from '../../constants/theme';
import { Card, StatCard, SectionTitle, Badge, PlatformIcon } from '../../components/UI';
import { MOCK_ANALYTICS, MOCK_POSTS } from '../../services/mockData';
import { PLATFORMS } from '../../constants/platforms';

const RANGES = ['7 days', '14 days', '30 days', '90 days'];

function fmtN(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('en-IN');
}

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const s = React.useMemo(() => getStyles(colors), [colors]);
  const [range, setRange] = useState('30 days');
  const totalLikes    = MOCK_ANALYTICS.platforms.reduce((s, p) => s + p.likes, 0);
  const totalComments = MOCK_ANALYTICS.platforms.reduce((s, p) => s + p.comments, 0);
  const totalShares   = MOCK_ANALYTICS.platforms.reduce((s, p) => s + p.shares, 0);
  const published = MOCK_POSTS.filter(p => p.status === 'published');

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rangeRow}>
        {RANGES.map(r => (
          <TouchableOpacity key={r} onPress={() => setRange(r)} style={[s.rangeBtn, range === r && s.rangeBtnActive]}>
            <Text style={[s.rangeTxt, range === r && s.rangeTxtActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.statsGrid}>
        <StatCard label="Impressions"   value={fmtN(MOCK_ANALYTICS.totalImpressions)} delta={18} />
        <StatCard label="Total Reach"   value={fmtN(MOCK_ANALYTICS.totalReach)}       delta={12} />
        <StatCard label="Engagement"    value={fmtN(MOCK_ANALYTICS.totalEngagement)}  delta={24} />
        <StatCard label="Avg Eng. Rate" value={`${MOCK_ANALYTICS.avgEngagementRate}%`} delta={3} />
      </View>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Engagement Breakdown" />
        <View style={s.engRow}>
          {[
            { label: 'Likes',    value: fmtN(totalLikes),    color: colors.danger,  emoji: '❤️' },
            { label: 'Comments', value: fmtN(totalComments), color: colors.brand,   emoji: '💬' },
            { label: 'Shares',   value: fmtN(totalShares),   color: colors.success, emoji: '↗️' },
          ].map(item => (
            <View key={item.label} style={s.engCard}>
              <Text style={s.engEmoji}>{item.emoji}</Text>
              <Text style={[s.engValue, { color: item.color }]}>{item.value}</Text>
              <Text style={s.engLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Platform Performance" />
        {MOCK_ANALYTICS.platforms.map((p, i) => {
          const pl = PLATFORMS[p.platform as keyof typeof PLATFORMS];
          const maxR = Math.max(...MOCK_ANALYTICS.platforms.map(x => x.reach));
          const pct = (p.reach / maxR) * 100;
          const engColor = p.engagementRate >= 7 ? colors.success : p.engagementRate >= 5 ? colors.warning : colors.textSec;
          return (
            <View key={p.platform} style={[s.platRow, i < MOCK_ANALYTICS.platforms.length - 1 && s.platRowBorder]}>
              <PlatformIcon platformId={p.platform} size={30} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={s.platMeta}>
                  <Text style={s.platName}>{pl?.name}</Text>
                  <Text style={[s.engRate, { color: engColor }]}>{p.engagementRate}%</Text>
                </View>
                <View style={s.reachBar}><View style={[s.reachFill, { width: `${pct}%` as any, backgroundColor: pl?.color }]} /></View>
                <View style={s.statsRow}>
                  <Text style={s.statItem}>👁️ {fmtN(p.reach)}</Text>
                  <Text style={s.statItem}>❤️ {fmtN(p.likes)}</Text>
                  <Text style={s.statItem}>💬 {fmtN(p.comments)}</Text>
                  <Text style={[s.statItem, { color: colors.success }]}>+{fmtN(p.followersGrowth)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Card>

      <SectionTitle title="Top Performing Posts" />
      {published.map(post => {
        const r = post.targets.reduce((sum, t) => sum + (t.reach ?? 0), 0);
        const l = post.targets.reduce((sum, t) => sum + (t.likes ?? 0), 0);
        return (
          <Card key={post.id} style={{ marginBottom: 10 }}>
            <Text style={s.postText} numberOfLines={2}>{post.text}</Text>
            <View style={s.postPlatforms}>{post.targets.map(t => <PlatformIcon key={t.id} platformId={t.platform} size={20} />)}</View>
            <View style={s.postMetrics}>
              <View style={s.metric}><Text style={s.metricVal}>{fmtN(r)}</Text><Text style={s.metricLbl}>Reach</Text></View>
              <View style={s.metric}><Text style={s.metricVal}>{fmtN(l)}</Text><Text style={s.metricLbl}>Likes</Text></View>
              <View style={s.metric}><Text style={s.metricVal}>{post.targets.reduce((sum, t) => sum + (t.comments ?? 0), 0)}</Text><Text style={s.metricLbl}>Comments</Text></View>
            </View>
          </Card>
        );
      })}

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Best Times to Post" />
        {[
          { platform: 'instagram', day: 'Wednesday', time: '9:00 AM' },
          { platform: 'twitter',   day: 'Tuesday',   time: '12:00 PM' },
          { platform: 'linkedin',  day: 'Tuesday',   time: '10:00 AM' },
          { platform: 'youtube',   day: 'Saturday',  time: '2:00 PM' },
        ].map(bt => (
          <View key={bt.platform} style={s.bestTimeRow}>
            <PlatformIcon platformId={bt.platform} size={28} />
            <Text style={s.bestDay}>{bt.day}</Text>
            <Badge label={bt.time} variant="info" />
          </View>
        ))}
      </Card>

      <Card style={{ marginBottom: 32 }}>
        <SectionTitle title="Top Hashtags" />
        {[
          { tag: '#indianinfluencer', reach: 180000, posts: 12 },
          { tag: '#lifestyle',        reach: 156000, posts: 18 },
          { tag: '#morningroutine',   reach: 124000, posts: 8  },
          { tag: '#ootd',             reach: 112000, posts: 14 },
          { tag: '#selfcare',         reach: 98000,  posts: 10 },
        ].map((ht, i) => (
          <View key={ht.tag} style={[s.hashRow, i < 4 && s.hashRowBorder]}>
            <Text style={s.hashRank}>{i + 1}</Text>
            <Text style={s.hashTag}>{ht.tag}</Text>
            <Text style={s.hashStats}>{ht.posts} posts · {fmtN(ht.reach)} reach</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const getStyles = (colors: typeof Colors) => StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.bg0 },
  content:        { padding: Spacing.lg, paddingTop: 8 },
  rangeRow:       { gap: 8, marginBottom: 16 },
  rangeBtn:       { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  rangeBtnActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  rangeTxt:       { fontSize: 12, color: colors.textSec, fontWeight: '600' },
  rangeTxtActive: { color: colors.white },
  statsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  engRow:         { flexDirection: 'row', gap: 10 },
  engCard:        { flex: 1, backgroundColor: colors.bg3, borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 },
  engEmoji:       { fontSize: 22 },
  engValue:       { fontSize: 18, fontWeight: '800' },
  engLabel:       { fontSize: 11, color: colors.textMuted },
  platRow:        { paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  platRowBorder:  { borderBottomWidth: 1, borderBottomColor: colors.border },
  platMeta:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  platName:       { fontSize: 13, fontWeight: '700', color: colors.text },
  engRate:        { fontSize: 13, fontWeight: '700' },
  reachBar:       { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  reachFill:      { height: '100%', borderRadius: 3 },
  statsRow:       { flexDirection: 'row', gap: 10 },
  statItem:       { fontSize: 11, color: colors.textMuted },
  postText:       { fontSize: 13, color: colors.textSec, lineHeight: 20, marginBottom: 10 },
  postPlatforms:  { flexDirection: 'row', gap: 6, marginBottom: 12 },
  postMetrics:    { flexDirection: 'row', gap: 16, alignItems: 'center' },
  metric:         { alignItems: 'center' },
  metricVal:      { fontSize: 16, fontWeight: '800', color: colors.text },
  metricLbl:      { fontSize: 10, color: colors.textMuted },
  bestTimeRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  bestDay:        { flex: 1, fontSize: 13, color: colors.textSec, fontWeight: '500' },
  hashRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  hashRowBorder:  { borderBottomWidth: 1, borderBottomColor: colors.border },
  hashRank:       { width: 20, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  hashTag:        { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
  hashStats:      { fontSize: 11, color: colors.textMuted },
});
