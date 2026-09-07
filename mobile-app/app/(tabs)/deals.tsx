import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import api from '../../services/api';

export default function MobileDealsScreen() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    api.get('/leads/my-deals').then((res) => {
      if (res.data.success) setDeals(res.data.deals);
    });
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>🤝 My Franchise Deals</Text>
      <Text style={styles.sub}>Track negotiations, meetings, due diligence, and signed agreements.</Text>

      {deals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active deals yet. Explore the Expo Floor to book discovery calls!</Text>
        </View>
      ) : (
        deals.map((deal) => (
          <View key={deal._id} style={styles.dealCard}>
            <View style={styles.brandRow}>
              <Image source={{ uri: deal.brandId?.logoUrl || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100' }} style={styles.logo} />
              <View>
                <Text style={styles.brandName}>{deal.brandId?.brandName}</Text>
                <Text style={styles.cat}>{deal.brandId?.category} • {deal.brandId?.investmentRange?.displayString}</Text>
              </View>
            </View>

            <View style={styles.stagePill}>
              <Text style={styles.stageText}>Stage: {deal.status}</Text>
            </View>

            <View style={styles.progressRow}>
              {['Lead', 'Meeting', 'Negotiation', 'Closed'].map((s, i) => (
                <View key={i} style={styles.stepBox}>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              ))}
            </View>
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
  dealCard: { backgroundColor: '#0d121f', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1f293d', marginBottom: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  logo: { width: 38, height: 38, borderRadius: 10 },
  brandName: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },
  cat: { fontSize: 11, color: '#94a3b8' },
  stagePill: { backgroundColor: '#1e293b', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  stageText: { color: '#60a5fa', fontSize: 10, fontWeight: 'bold' },
  progressRow: { flexDirection: 'row', gap: 4 },
  stepBox: { flex: 1, backgroundColor: '#07090e', paddingVertical: 6, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  stepText: { color: '#94a3b8', fontSize: 9, fontWeight: 'bold' },
  emptyCard: { padding: 30, alignItems: 'center', backgroundColor: '#0d121f', borderRadius: 16 },
  emptyText: { color: '#64748b', fontSize: 12, textAlign: 'center' },
});
