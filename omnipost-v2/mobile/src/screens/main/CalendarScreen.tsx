// src/screens/main/CalendarScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { Card, PlatformIcon, Badge, Button } from '../../components/UI';
import { MOCK_POSTS } from '../../services/mockData';
import { useUIStore } from '../../store/uiStore';
import { format } from 'date-fns';

export default function CalendarScreen({ navigation }: any) {
  const { openComposer } = useUIStore();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const DAYS_IN_MAY = 30;
  const START_DAY   = 3; // May 2025 starts on Thursday

  const postDays: Record<number, { color: string; type: 'published' | 'scheduled' }[]> = {
    1:  [{ color: '#10B981', type: 'published' }],
    3:  [{ color: '#E1306C', type: 'published' }],
    8:  [{ color: '#E1306C', type: 'published' }, { color: '#1DA1F2', type: 'published' }],
    10: [{ color: '#E1306C', type: 'published' }, { color: '#1877F2', type: 'published' }, { color: '#FF0000', type: 'published' }],
    15: [{ color: '#1DA1F2', type: 'published' }],
    18: [{ color: '#E1306C', type: 'published' }],
    22: [{ color: '#E1306C', type: 'published' }],
    25: [{ color: '#FF0000', type: 'published' }],
    4:  [{ color: '#22D3EE', type: 'scheduled' }],
  };

  const scheduled = MOCK_POSTS.filter(p => p.status === 'scheduled');
  const published  = MOCK_POSTS.filter(p => p.status === 'published');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.monthTitle}>May 2025</Text>
        <Button label="+ Schedule" onPress={openComposer} style={styles.schedBtn} />
      </View>

      {/* Calendar */}
      <Card style={{ marginBottom: 16 }}>
        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <Text key={i} style={styles.weekDay}>{d}</Text>
          ))}
        </View>
        {/* Day grid */}
        <View style={styles.daysGrid}>
          {Array.from({ length: START_DAY }).map((_, i) => <View key={`b${i}`} style={styles.dayCell} />)}
          {Array.from({ length: DAYS_IN_MAY }, (_, i) => i + 1).map(day => {
            const dots   = postDays[day] ?? [];
            const isToday= day === 5;
            const isSel  = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day === selectedDay ? null : day)}
                style={[styles.dayCell, isToday && styles.dayCellToday, isSel && styles.dayCellSelected]}
              >
                <Text style={[styles.dayNum, isToday && styles.dayNumToday, isSel && styles.dayNumSelected]}>
                  {day}
                </Text>
                <View style={styles.dotsRow}>
                  {dots.slice(0, 3).map((d, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: d.type === 'scheduled' ? Colors.cyan : d.color }]} />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: Colors.success }]}/><Text style={styles.legendText}>Published</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: Colors.cyan }]}/><Text style={styles.legendText}>Scheduled</Text></View>
        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: Colors.brand, borderRadius: 3 }]}/><Text style={styles.legendText}>Today</Text></View>
      </View>

      {/* Scheduled posts */}
      <Text style={styles.sectionTitle}>📅 Upcoming Scheduled</Text>
      {scheduled.length === 0
        ? <Text style={styles.emptyText}>No scheduled posts yet. Create one!</Text>
        : scheduled.map(post => (
          <Card key={post.id} style={[styles.postCard, { borderColor: Colors.cyan + '44', backgroundColor: Colors.cyanDim }]}>
            <View style={styles.postRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateMonth}>{post.scheduledAt && format(new Date(post.scheduledAt), 'MMM').toUpperCase()}</Text>
                <Text style={styles.dateDay}>{post.scheduledAt && format(new Date(post.scheduledAt), 'd')}</Text>
                <Text style={styles.dateTime}>{post.scheduledAt && format(new Date(post.scheduledAt), 'h:mm a')}</Text>
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
        ))
      }

      {/* Recent published */}
      <Text style={styles.sectionTitle}>✅ Recently Published</Text>
      {published.map(post => (
        <Card key={post.id} style={styles.postCard}>
          <Text style={styles.postText} numberOfLines={2}>{post.text}</Text>
          <View style={styles.postMeta}>
            {post.targets.map(t => <PlatformIcon key={t.id} platformId={t.platform} size={18} />)}
            <Text style={styles.postTime}>{post.publishedAt && format(new Date(post.publishedAt), 'MMM d · h:mm a')}</Text>
          </View>
        </Card>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg0 },
  content: { padding: Spacing.lg },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  monthTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  schedBtn:   { paddingVertical: 9, paddingHorizontal: 14 },

  weekRow:  { flexDirection: 'row', marginBottom: 6 },
  weekDay:  { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: Colors.textMuted, paddingVertical: 4 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell:  { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4, borderRadius: 8 },
  dayCellToday:   { backgroundColor: Colors.brandDim, borderWidth: 1, borderColor: Colors.brandBdr },
  dayCellSelected:{ backgroundColor: Colors.brand },
  dayNum:         { fontSize: 12, color: Colors.textSec, fontWeight: '500' },
  dayNumToday:    { color: Colors.brand, fontWeight: '800' },
  dayNumSelected: { color: Colors.white, fontWeight: '800' },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot:     { width: 5, height: 5, borderRadius: 3 },

  legend:     { flexDirection: 'row', gap: 16, marginBottom: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontSize: 11, color: Colors.textMuted },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  emptyText:    { fontSize: 13, color: Colors.textMuted, textAlign: 'center', padding: 20 },

  postCard: { marginBottom: 10 },
  postRow:  { flexDirection: 'row', gap: 12 },
  dateBox:  { width: 44, height: 52, borderRadius: 10, backgroundColor: Colors.cyanDim, borderWidth: 1, borderColor: Colors.cyan + '44', alignItems: 'center', justifyContent: 'center' },
  dateMonth:{ fontSize: 8, fontWeight: '800', color: Colors.cyan },
  dateDay:  { fontSize: 20, fontWeight: '900', color: Colors.cyan, lineHeight: 22 },
  dateTime: { fontSize: 8, color: Colors.cyan + 'AA' },
  postText: { fontSize: 12, color: Colors.textSec, lineHeight: 18, flex: 1 },
  postMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8 },
  postTime: { fontSize: 11, color: Colors.textMuted, marginLeft: 'auto' },
});
