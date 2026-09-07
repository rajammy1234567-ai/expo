import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, Calendar, Heart, ArrowRight } from 'lucide-react-native';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function ShowcaseScreen() {
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    api.get('/brands').then((res) => {
      if (res.data.success) setBrands(res.data.brands);
    });
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={brands}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.reelCard}>
            <Image source={{ uri: item.bannerUrl || item.logoUrl }} style={styles.reelMedia} />
            <View style={styles.gradientOverlay} />

            {/* Top Reel Info */}
            <View style={styles.topInfo}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <View style={styles.modelBadge}>
                <Text style={styles.modelText}>{item.businessModel}</Text>
              </View>
            </View>

            {/* Bottom Content */}
            <View style={styles.bottomInfo}>
              <View style={styles.brandRow}>
                <Image source={{ uri: item.logoUrl }} style={styles.logo} />
                <View>
                  <Text style={styles.brandName}>{item.brandName}</Text>
                  <Text style={styles.tagline}>{item.tagline}</Text>
                </View>
              </View>

              <View style={styles.specsRow}>
                <View style={styles.spec}>
                  <Text style={styles.specLabel}>INVESTMENT</Text>
                  <Text style={styles.specVal}>{item.investmentRange?.displayString}</Text>
                </View>
                <View style={styles.spec}>
                  <Text style={styles.specLabel}>REQUIRED AREA</Text>
                  <Text style={styles.specVal}>{item.requiredAreaSqFt?.displayString}</Text>
                </View>
                <View style={styles.spec}>
                  <Text style={styles.specLabel}>PAYBACK</Text>
                  <Text style={styles.specVal}>{item.estimatedROIHistoricalMonths?.min}–{item.estimatedROIHistoricalMonths?.max} Mo*</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() => router.push(`/brand/${item._id}`)}
                >
                  <Sparkles color="#ffffff" size={14} />
                  <Text style={styles.detailsBtnText}>Ask AI / Explore Booth</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.meetBtn}
                  onPress={() => router.push(`/brand/${item._id}`)}
                >
                  <Calendar color="#07090e" size={14} />
                  <Text style={styles.meetBtnText}>Meet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090e' },
  reelCard: { width, height: height - 60, backgroundColor: '#020617', justifyContent: 'space-between' },
  reelMedia: { width: '100%', height: '100%', position: 'absolute' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000066' },
  topInfo: { flexDirection: 'row', gap: 8, padding: 20, paddingTop: 50 },
  categoryBadge: { backgroundColor: '#3b82f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  categoryText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  modelBadge: { backgroundColor: '#f59e0b22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#f59e0b' },
  modelText: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold' },
  bottomInfo: { padding: 20, paddingBottom: 40, backgroundColor: '#07090ecc', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  logo: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  brandName: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  tagline: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  specsRow: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 14, padding: 10, justifyContent: 'space-around', marginBottom: 14 },
  spec: { alignItems: 'center' },
  specLabel: { fontSize: 8, color: '#64748b', fontWeight: 'bold' },
  specVal: { fontSize: 11, color: '#10b981', fontWeight: 'bold', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8 },
  detailsBtn: { flex: 1.5, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  detailsBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  meetBtn: { flex: 1, backgroundColor: '#f59e0b', paddingVertical: 12, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  meetBtnText: { color: '#07090e', fontSize: 12, fontWeight: 'bold' },
});
