// src/screens/main/DashboardScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useUIStore }   from '../../store/uiStore';
import { Card, StatCard, SectionTitle, Badge, PlatformIcon } from '../../components/UI';
import { Colors, Spacing } from '../../constants/theme';
import { MOCK_ACCOUNTS, MOCK_POSTS, MOCK_ANALYTICS } from '../../services/mockData';
import { PLATFORMS } from '../../constants/platforms';
import { format, formatDistanceToNow } from 'date-fns';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { openComposer } = useUIStore();
  const firstName = user?.name?.split(' ')[0] ?? 'Creator';
  const connected = MOCK_ACCOUNTS.filter(a => a.status === 'connected');
  const expired   = MOCK_ACCOUNTS.filter(a => a.status === 'expired');
  const scheduled = MOCK_POSTS.filter(p => p.status === 'scheduled');
  const published = MOCK_POSTS.filter(p => p.status === 'published');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerGreet}>Good morning, {firstName}! ✨</Text>
          <Text style={styles.bannerSub}>
            {scheduled.length} scheduled · {connected.length} platforms connected
            {expired.length > 0 && ` · ⚠️ ${expired.length} token expired`}
          </Text>
        </View>
        <TouchableOpacity onPress={openComposer} style={styles.createBtn}>
          <Text style={styles.createBtnText}>+ New Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={{ gap: 8 }}>
        {MOCK_ACCOUNTS.map(acc => (
          <View key={acc.id} style={[styles.pill, acc.status === 'expired' && styles.pillExpired]}>
            <PlatformIcon platformId={acc.platform} size={18} />
            <Text style={[styles.pillText, acc.status === 'expired' && { color: Colors.warning }]}>{acc.username}</Text>
            <View style={[styles.pillDot, { backgroundColor: acc.status === 'connected' ? Colors.success : Colors.warning }]} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.statsGrid}>
        <StatCard label="Impressions" value="2.84M" delta={18} />
        <StatCard label="Total Reach"  value="1.25M" delta={12} />
        <StatCard label="Engagement"   value="89.4K" delta={24} />
        <StatCard label="Eng. Rate"    value="7.16%" delta={3}  />
      </View>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle title="Platform Reach" />
        {MOCK_ANALYTICS.platforms.slice(0, 4).map(p => {
          const pct = (p.reach / 540000) * 100;
          const pl = PLATFORMS[p.platform as keyof typeof PLATFORMS];
          return (
            <View key={p.platform} style={{ marginBottom: 10 }}>
              <View style={styles.reachRow}>
                <PlatformIcon platformId={p.platform} size={20} />
                <Text style={styles.reachName}>{pl?.name}</Text>
                <Text style={styles.reachVal}>{(p.reach / 1000).toFixed(0)}k</Text>
              </View>
              <View style={styles.reachBar}>
                <View style={[styles.reachFill, { width: `${pct}%` as any, backgroundColor: pl?.color }]} />
              </View>
            </View>
          );
        })}
      </Card>

      <SectionTitle title="Recent Posts" action="See all" onAction={() => navigation.navigate('Analytics')} />
      {published.slice(0, 2).map(post => (
        <Card key={post.id} style={{ marginBottom: 10 }}>
          <View style={styles.postRow}>
            {post.media[0] && (
              <Image source={{ uri: post.media[0].thumbUrl ?? post.media[0].url }} style={styles.postThumb} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.postText} numberOfLines={2}>{post.text}</Text>
              <View style={styles.postMeta}>
                {post.targets.slice(0, 3).map(t => <PlatformIcon key={t.id} platformId={t.platform} size={18} />)}
                <Text style={styles.postTime}>
                  {post.publishedAt && formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                </Text>
              </View>
              {post.targets[0]?.likes !== undefined && (
                <Text style={styles.postStats}>
                  ❤️ {post.targets.reduce((s,t) => s + (t.likes||0), 0).toLocaleString('en-IN')}{'  '}
                  💬 {post.targets.reduce((s,t) => s + (t.comments||0), 0).toLocaleString('en-IN')}{'  '}
                  👁️ {post.targets.reduce((s,t) => s + (t.reach||0), 0).toLocaleString('en-IN')}
                </Text>
              )}
            </View>
          </View>
        </Card>
      ))}

      {scheduled.length > 0 && (
        <>
          <SectionTitle title="Upcoming Scheduled" action="Calendar" onAction={() => navigation.navigate('Calendar')} />
          {scheduled.map(post => (
            <Card key={post.id} style={{ marginBottom: 10, borderColor: Colors.cyan + '44', backgroundColor: Colors.cyanDim }}>
              <View style={styles.postRow}>
                <View style={styles.scheduledDate}>
                  <Text style={styles.scheduledMonth}>
                    {post.scheduledAt && format(new Date(post.scheduledAt), 'MMM').toUpperCase()}
                  </Text>
                  <Text style={styles.scheduledDay}>
                    {post.scheduledAt && format(new Date(post.scheduledAt), 'd')}
                  </Text>
                  <Text style={styles.scheduledTime}>
                    {post.scheduledAt && format(new Date(post.scheduledAt), 'h:mm a')}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postText} numberOfLines={2}>{post.text}</Text>
                  <View style={styles.postMeta}>
                    {post.targets.map(t => <PlatformIcon key={t.id} platformId={t.platform} size={18} />)}
                    <Badge label="Scheduled" variant="info" />
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </>
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg0 },
  content: { padding: Spacing.lg, paddingTop: 12 },
  banner:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bg2, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 14 },
  bannerGreet: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  bannerSub:   { fontSize: 12, color: Colors.textSec, lineHeight: 18 },
  createBtn:   { backgroundColor: Colors.brand, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 9 },
  createBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  pillScroll: { marginBottom: 14 },
  pill:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: Colors.bg2, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  pillExpired:{ borderColor: Colors.warning + '66', backgroundColor: Colors.warningDim },
  pillText:   { fontSize: 11, color: Colors.textSec, fontWeight: '500' },
  pillDot:    { width: 6, height: 6, borderRadius: 3 },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  reachRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  reachName:  { flex: 1, fontSize: 12, color: Colors.textSec },
  reachVal:   { fontSize: 12, color: Colors.textMuted },
  reachBar:   { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  reachFill:  { height: '100%', borderRadius: 3 },
  postRow:    { flexDirection: 'row', gap: 12 },
  postThumb:  { width: 56, height: 44, borderRadius: 9 },
  postText:   { fontSize: 12, color: Colors.textSec, lineHeight: 18, flex: 1 },
  postMeta:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  postTime:   { fontSize: 10, color: Colors.textMuted, marginLeft: 'auto' },
  postStats:  { fontSize: 11, color: Colors.textMuted, marginTop: 5 },
  scheduledDate:  { width: 44, height: 52, borderRadius: 10, backgroundColor: Colors.cyanDim, borderWidth: 1, borderColor: Colors.cyan + '44', alignItems: 'center', justifyContent: 'center' },
  scheduledMonth: { fontSize: 8, fontWeight: '700', color: Colors.cyan, textTransform: 'uppercase' },
  scheduledDay:   { fontSize: 20, fontWeight: '900', color: Colors.cyan, lineHeight: 22 },
  scheduledTime:  { fontSize: 8, color: Colors.cyan + 'AA' },
});
