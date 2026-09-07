import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Calendar, Video, Clock } from 'lucide-react-native';
import api from '../../services/api';

export default function MobileMeetingsScreen() {
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    api.get('/meetings').then((res) => {
      if (res.data.success) setMeetings(res.data.meetings);
    });
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>📅 Scheduled Meetings</Text>
      <Text style={styles.sub}>Direct 1-on-1 video consultations with verified franchisor leadership.</Text>

      {meetings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No upcoming meetings scheduled.</Text>
        </View>
      ) : (
        meetings.map((m) => (
          <View key={m._id} style={styles.card}>
            <View style={styles.row}>
              <Image source={{ uri: m.brandId?.logoUrl || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100' }} style={styles.logo} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{m.brandId?.brandName}</Text>
                <Text style={styles.notes}>{m.notesFromInvestor}</Text>
                <View style={styles.timeRow}>
                  <Clock color="#3b82f6" size={12} />
                  <Text style={styles.timeText}>{new Date(m.scheduledStartTime).toLocaleTimeString()}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => Alert.alert('Launching Call Room', `Connecting to WebRTC room for ${m.brandId?.brandName}...`)}
            >
              <Video color="#ffffff" size={14} />
              <Text style={styles.joinText}>Join Video Discovery Room</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090e' },
  content: { padding: 16, paddingTop: 40 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  sub: { fontSize: 11, color: '#94a3b8', marginTop: 2, marginBottom: 16 },
  card: { backgroundColor: '#0d121f', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1f293d', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  logo: { width: 44, height: 44, borderRadius: 12 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
  notes: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  timeText: { fontSize: 10, color: '#60a5fa' },
  joinBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  joinText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  emptyCard: { padding: 30, alignItems: 'center', backgroundColor: '#0d121f', borderRadius: 16 },
  emptyText: { color: '#64748b', fontSize: 12 },
});
