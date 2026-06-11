// src/screens/main/CalendarScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, useTheme } from '../../constants/theme';
import { Card, PlatformIcon, Badge, Button } from '../../components/UI';
import { MOCK_POSTS } from '../../services/mockData';
import { useUIStore } from '../../store/uiStore';
import { format } from 'date-fns';
import { useSearchStore } from '../../store/searchStore';

export default function CalendarScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = React.useMemo(() => getStyles(colors), [colors]);
  const { openComposer } = useUIStore();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const searchQuery = useSearchStore((state) => state.queries['Calendar'] || '');

  const DAYS_IN_MAY = 30;
  const START_DAY   = 3;

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

  const queryLower = searchQuery.toLowerCase();
  const scheduled = MOCK_POSTS.filter(p => p.status === 'scheduled' && p.text.toLowerCase().includes(queryLower));
  const published  = MOCK_POSTS.filter(p => p.status === 'published' && p.text.toLowerCase().includes(queryLower));

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.monthTitle}>May 2025</Text>
        <Button label="+ Schedule" onPress={openComposer} style={s.schedBtn} />
      </View>

      <Card style={{ marginBottom: 16 }}>
        <View style={s.weekRow}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <Text key={i} style={s.weekDay}>{d}</Text>
          ))}
        </View>
        <View style={s.daysGrid}>
          {Array.from({ length: START_DAY }).map((_, i) => <View key={`b${i}`} style={s.dayCell} />)}
          {Array.from({ length: DAYS_IN_MAY }, (_, i) => i + 1).map(day => {
            const dots   = postDays[day] ?? [];
            const isToday= day === 5;
            const isSel  = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day === selectedDay ? null : day)}
                style={[s.dayCell, isToday && s.dayCellToday, isSel && s.dayCellSelected]}
              >
                <Text style={[s.dayNum, isToday && s.dayNumToday, isSel && s.dayNumSelected]}>{day}</Text>
                <View style={s.dotsRow}>
                  {dots.slice(0, 3).map((d, i) => (
                    <View key={i} style={[s.dot, { backgroundColor: d.type === 'scheduled' ? colors.cyan : d.color }]} />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <View style={s.legend}>
        <View style={s.legendItem}><View style={[s.dot, { backgroundColor: colors.success }]}/><Text style={s.legendText}>Published</Text></View>
        <View style={s.legendItem}><View style={[s.dot, { backgroundColor: colors.cyan }]}/><Text style={s.legendText}>Scheduled</Text></View>
        <View style={s.legendItem}><View style={[s.dot, { backgroundColor: colors.brand }]}/><Text style={s.legendText}>Today</Text></View>
      </View>

      <Text style={s.sectionTitle}>📅 Upcoming Scheduled</Text>
      {scheduled.length === 0
        ? <Text style={s.emptyText}>No scheduled posts yet. Create one!</Text>
        : scheduled.map(post => (
          <Card key={post.id} style={[s.postCard, { borderColor: colors.cyan + '44', backgroundColor: colors.cyanDim }]}>
            <View style={s.postRow}>
              <View style={s.dateBox}>
                <Text style={s.dateMonth}>{post.scheduledAt && format(new Date(post.scheduledAt), 'MMM').toUpperCase()}</Text>
                <Text style={s.dateDay}>{post.scheduledAt && format(new Date(post.scheduledAt), 'd')}</Text>
                <Text style={s.dateTime}>{post.scheduledAt && format(new Date(post.scheduledAt), 'h:mm a')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.postText} numberOfLines={2}>{post.text}</Text>
                <View style={s.postMeta}>
                  {post.targets.map(t => <PlatformIcon key={t.id} platformId={t.platform} size={18} />)}
                  <Badge label="Scheduled" variant="info" />
                </View>
              </View>
            </View>
          </Card>
        ))
      }

      <Text style={s.sectionTitle}>✅ Recently Published</Text>
      {published.map(post => (
        <Card key={post.id} style={s.postCard}>
          <Text style={s.postText} numberOfLines={2}>{post.text}</Text>
          <View style={s.postMeta}>
            {post.targets.map(t => <PlatformIcon key={t.id} platformId={t.platform} size={18} />)}
            <Text style={s.postTime}>{post.publishedAt && format(new Date(post.publishedAt), 'MMM d · h:mm a')}</Text>
          </View>
        </Card>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const getStyles = (colors: typeof Colors) => StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.bg0 },
  content:        { padding: Spacing.lg, paddingTop: 12 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  monthTitle:     { fontSize: 20, fontWeight: '900', color: colors.text },
  schedBtn:       { paddingVertical: 9, paddingHorizontal: 14 },
  weekRow:        { flexDirection: 'row', marginBottom: 6 },
  weekDay:        { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.textMuted, paddingVertical: 4 },
  daysGrid:       { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell:        { width: `${100/7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4, borderRadius: 8 },
  dayCellToday:   { backgroundColor: colors.brandDim, borderWidth: 1, borderColor: colors.brandBdr },
  dayCellSelected:{ backgroundColor: colors.brand },
  dayNum:         { fontSize: 12, color: colors.textSec, fontWeight: '500' },
  dayNumToday:    { color: colors.brand, fontWeight: '800' },
  dayNumSelected: { color: colors.white, fontWeight: '800' },
  dotsRow:        { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot:            { width: 5, height: 5, borderRadius: 3 },
  legend:         { flexDirection: 'row', gap: 16, marginBottom: 20 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText:     { fontSize: 11, color: colors.textMuted },
  sectionTitle:   { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 12 },
  emptyText:      { fontSize: 13, color: colors.textMuted, textAlign: 'center', padding: 20 },
  postCard:       { marginBottom: 10 },
  postRow:        { flexDirection: 'row', gap: 12 },
  dateBox:        { width: 44, height: 52, borderRadius: 10, backgroundColor: colors.cyanDim, borderWidth: 1, borderColor: colors.cyan + '44', alignItems: 'center', justifyContent: 'center' },
  dateMonth:      { fontSize: 8, fontWeight: '800', color: colors.cyan },
  dateDay:        { fontSize: 20, fontWeight: '900', color: colors.cyan, lineHeight: 22 },
  dateTime:       { fontSize: 8, color: colors.cyan + 'AA' },
  postText:       { fontSize: 12, color: colors.textSec, lineHeight: 18, flex: 1 },
  postMeta:       { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8 },
  postTime:       { fontSize: 11, color: colors.textMuted, marginLeft: 'auto' },
});
