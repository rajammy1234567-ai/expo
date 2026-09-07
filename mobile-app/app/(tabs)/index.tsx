import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight, Heart, Calendar, Building, CheckCircle2 } from 'lucide-react-native';
import api from '../../services/api';

export default function InvestorHomeScreen() {
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('25L_50L');

  const categories = ['All', 'Food', 'Education', 'Retail', 'Fitness', 'Beauty', 'Healthcare', 'EV', 'Technology'];
  const budgets = [
    { id: '', label: 'All' },
    { id: 'UNDER_5L', label: '< ₹5L' },
    { id: '5L_10L', label: '₹5–10L' },
    { id: '10L_25L', label: '₹10–25L' },
    { id: '25L_50L', label: '₹25–50L' },
    { id: '50L_1CR', label: '₹50L–1Cr' },
    { id: '1CR_PLUS', label: '₹1Cr+' },
  ];

  useEffect(() => {
    fetchBrands();
  }, [selectedCategory, selectedBudget]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands', {
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          budgetBracket: selectedBudget || undefined,
        },
      });
      if (res.data.success) {
        setBrands(res.data.brands);
      }
    } catch (e) {
      console.warn('API error, using mock catalog for mobile demo', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Greeting Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, Rohit 👋</Text>
          <View style={styles.expoBadgeRow}>
            <Text style={styles.expoTitle}>EXPO 24/7</Text>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live Floor</Text>
          </View>
        </View>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
          style={styles.avatar}
        />
      </View>

      {/* AI Match for You Banner */}
      <TouchableOpacity
        style={styles.aiMatchBanner}
        onPress={() => router.push('/(tabs)/showcase')}
      >
        <View style={styles.aiMatchIcon}>
          <Sparkles color="#3b82f6" size={20} />
        </View>
        <View style={styles.aiMatchTextCol}>
          <Text style={styles.aiMatchTitle}>AI Match for You</Text>
          <Text style={styles.aiMatchSubtitle}>12 brands matched with your profile</Text>
        </View>
        <View style={styles.viewMatchesBtn}>
          <Text style={styles.viewMatchesText}>View</Text>
          <ArrowRight color="#ffffff" size={14} />
        </View>
      </TouchableOpacity>

      {/* Category Pills */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}
          >
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Investment Range Horizontal Bar */}
      <Text style={styles.sectionTitle}>Investment Range</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.budgetScroll}>
        {budgets.map((b) => (
          <TouchableOpacity
            key={b.id}
            onPress={() => setSelectedBudget(b.id)}
            style={[styles.budgetPill, selectedBudget === b.id && styles.budgetPillActive]}
          >
            <Text style={[styles.budgetText, selectedBudget === b.id && styles.budgetTextActive]}>
              {b.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Brand Showcase Section (Netflix-Style Cards) */}
      <View style={styles.showcaseHeader}>
        <Text style={styles.sectionTitle}>🎬 Brand Showcase</Text>
        <Text style={styles.brandCountText}>{brands.length} Brands</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#3b82f6" size="large" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.brandList}>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand._id}
              style={styles.brandCard}
              onPress={() => router.push(`/brand/${brand._id}`)}
            >
              <Image source={{ uri: brand.bannerUrl || brand.logoUrl }} style={styles.brandBanner} />

              <View style={styles.cardOverlay}>
                <View style={styles.modelBadge}>
                  <Text style={styles.modelText}>{brand.businessModel}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.brandNameRow}>
                  <Image source={{ uri: brand.logoUrl }} style={styles.brandLogo} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.brandName} numberOfLines={1}>{brand.brandName}</Text>
                    <Text style={styles.brandCat}>{brand.category} • {brand.targetExpansionCities?.[0] || 'Chandigarh'}</Text>
                  </View>
                </View>

                {/* Specs Row */}
                <View style={styles.specsRow}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>INVESTMENT</Text>
                    <Text style={styles.specValue}>{brand.investmentRange?.displayString}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>SPACE</Text>
                    <Text style={styles.specValue}>{brand.requiredAreaSqFt?.displayString}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>MODEL</Text>
                    <Text style={styles.specValue}>{brand.businessModel}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.aiBtn}
                    onPress={() => router.push(`/brand/${brand._id}`)}
                  >
                    <Sparkles color="#3b82f6" size={14} />
                    <Text style={styles.aiBtnText}>Ask AI</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.meetBtn}
                    onPress={() => router.push(`/brand/${brand._id}`)}
                  >
                    <Calendar color="#07090e" size={14} />
                    <Text style={styles.meetBtnText}>Request Meeting</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090e' },
  content: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '900', color: '#ffffff' },
  expoBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  expoTitle: { fontSize: 13, fontWeight: 'bold', color: '#3b82f6', letterSpacing: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginHorizontal: 6 },
  liveText: { fontSize: 11, color: '#94a3b8' },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#334155' },
  aiMatchBanner: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e3a8a',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aiMatchIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  aiMatchTextCol: { flex: 1, marginLeft: 12 },
  aiMatchTitle: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },
  aiMatchSubtitle: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  viewMatchesBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewMatchesText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#ffffff', marginBottom: 10 },
  catScroll: { marginBottom: 16 },
  catPill: { backgroundColor: '#0f172a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, marginRight: 8, borderWidth: 1, borderColor: '#1e293b' },
  catPillActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  catText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  catTextActive: { color: '#ffffff', fontWeight: 'bold' },
  budgetScroll: { marginBottom: 20 },
  budgetPill: { backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 6, borderWidth: 1, borderColor: '#1e293b' },
  budgetPillActive: { backgroundColor: '#064e3b', borderColor: '#10b981' },
  budgetText: { fontSize: 11, color: '#94a3b8' },
  budgetTextActive: { color: '#34d399', fontWeight: 'bold' },
  showcaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandCountText: { fontSize: 11, color: '#64748b' },
  brandList: { gap: 16 },
  brandCard: { backgroundColor: '#0d121f', borderRadius: 20, borderWidth: 1, borderColor: '#1f293d', overflow: 'hidden', marginBottom: 14 },
  brandBanner: { width: '100%', height: 160, backgroundColor: '#020617' },
  cardOverlay: { position: 'absolute', top: 12, left: 12 },
  modelBadge: { backgroundColor: '#020617dd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#f59e0b' },
  modelText: { color: '#f59e0b', fontSize: 10, fontWeight: 'bold' },
  cardBody: { padding: 14 },
  brandNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  brandLogo: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  brandName: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
  brandCat: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  specsRow: { flexDirection: 'row', backgroundColor: '#07090e', borderRadius: 12, padding: 8, justifyContent: 'space-around', marginBottom: 12 },
  specItem: { alignItems: 'center' },
  specLabel: { fontSize: 8, color: '#64748b', fontWeight: 'bold' },
  specValue: { fontSize: 11, color: '#e2e8f0', fontWeight: 'bold', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8 },
  aiBtn: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 9, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#3b82f644' },
  aiBtnText: { color: '#60a5fa', fontSize: 12, fontWeight: 'bold' },
  meetBtn: { flex: 1.2, backgroundColor: '#f59e0b', borderRadius: 12, paddingVertical: 9, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  meetBtnText: { color: '#07090e', fontSize: 12, fontWeight: 'bold' },
});
