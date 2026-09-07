import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Sparkles,
  Calendar,
  Download,
  CheckCircle2,
  Building,
  MapPin,
  IndianRupee,
  ShieldCheck,
  X,
  Send,
  Bot,
} from 'lucide-react-native';
import api from '../../services/api';

export default function BrandBoothScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Modal
  const [showAI, setShowAI] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputQ, setInputQ] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Meeting Modal
  const [showMeeting, setShowMeeting] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('Interested in opening outlet in Chandigarh.');

  useEffect(() => {
    fetchBrandDetails();
  }, [id]);

  const fetchBrandDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/brands/${id}`);
      if (res.data.success) {
        setBrand(res.data.brand);
        setMessages([
          {
            sender: 'bot',
            text: `Namaste! Main **${res.data.brand.brandName}** ka official AI Franchise Bot hoon. Total investment, FOFO model, ya location availability ke baare mein kuch bhi puchein!`,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAI = async (queryText: string) => {
    const text = queryText || inputQ;
    if (!text.trim() || !brand) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputQ('');
    setAiLoading(true);

    try {
      const res = await api.post('/ai/ask-brand', {
        brandId: brand._id,
        question: text,
      });
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.data.answer,
            sources: res.data.data.sources,
            suggestMeeting: res.data.data.suggestMeeting,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Brand ke approved data ke according aap direct discovery call schedule kar sakte hain.',
          suggestMeeting: true,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleBookMeeting = async () => {
    try {
      await api.post('/meetings/request', {
        brandId: brand._id,
        meetingType: 'VIDEO_CALL',
        notesFromInvestor: meetingNotes,
      });
      setShowMeeting(false);
      Alert.alert('Meeting Requested! 🔔', `${brand.brandName} leadership has been notified. You will receive a video room invite shortly.`);
    } catch (e) {
      Alert.alert('Error', 'Unable to book meeting. Please try again.');
    }
  };

  if (loading || !brand) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#3b82f6" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner / Pitch Reel */}
        <Image source={{ uri: brand.bannerUrl || brand.logoUrl }} style={styles.banner} />

        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Image source={{ uri: brand.logoUrl }} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.name}>{brand.brandName}</Text>
              <CheckCircle2 color="#3b82f6" size={16} />
            </View>
            <Text style={styles.tagline}>{brand.tagline}</Text>
            <Text style={styles.model}>{brand.businessModel} Model • {brand.category}</Text>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>INVESTMENT</Text>
            <Text style={styles.metricVal}>{brand.investmentRange?.displayString}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>REQUIRED SPACE</Text>
            <Text style={styles.metricVal}>{brand.requiredAreaSqFt?.displayString}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>HISTORICAL PAYBACK</Text>
            <Text style={styles.metricVal}>{brand.estimatedROIHistoricalMonths?.min}–{brand.estimatedROIHistoricalMonths?.max} Mo*</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Franchise</Text>
          <Text style={styles.desc}>{brand.description}</Text>
        </View>

        {/* Expansion Targets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expansion Targets</Text>
          <View style={styles.cityRow}>
            {brand.targetExpansionCities?.map((c: string, i: number) => (
              <View key={i} style={styles.cityPill}>
                <MapPin color="#3b82f6" size={12} />
                <Text style={styles.cityText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomDock}>
        <TouchableOpacity style={styles.aiDockBtn} onPress={() => setShowAI(true)}>
          <Sparkles color="#3b82f6" size={16} />
          <Text style={styles.aiDockText}>Ask AI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.meetDockBtn} onPress={() => setShowMeeting(true)}>
          <Calendar color="#07090e" size={16} />
          <Text style={styles.meetDockText}>Request Meeting</Text>
        </TouchableOpacity>
      </View>

      {/* AI Bot Chat Modal */}
      <Modal visible={showAI} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.aiModalBox}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Bot color="#3b82f6" size={20} />
                <Text style={styles.modalTitle}>{brand.brandName} AI Bot</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAI(false)}>
                <X color="#94a3b8" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.disclaimerPill}>
              <Text style={styles.disclaimerText}>🛡️ Grounded on brand facts. No fake ROI guarantee.</Text>
            </View>

            <ScrollView style={styles.msgScroll} contentContainerStyle={{ padding: 12, gap: 10 }}>
              {messages.map((m, i) => (
                <View
                  key={i}
                  style={[
                    styles.bubble,
                    m.sender === 'user' ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text style={styles.bubbleText}>{m.text}</Text>
                  {m.suggestMeeting && (
                    <TouchableOpacity
                      style={styles.aiMeetingBtn}
                      onPress={() => {
                        setShowAI(false);
                        setShowMeeting(true);
                      }}
                    >
                      <Calendar color="#07090e" size={12} />
                      <Text style={styles.aiMeetingBtnText}>Book Discovery Meeting</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {aiLoading && <ActivityIndicator color="#3b82f6" size="small" />}
            </ScrollView>

            {/* Quick Prompts */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
              {['Total investment kitna hai?', 'Chandigarh me available hai?', 'Expected Payback & ROI?'].map((p, i) => (
                <TouchableOpacity key={i} style={styles.promptPill} onPress={() => handleSendAI(p)}>
                  <Text style={styles.promptText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                value={inputQ}
                onChangeText={setInputQ}
                placeholder="Ask about investment, FOFO model..."
                placeholderTextColor="#64748b"
                style={styles.input}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={() => handleSendAI(inputQ)}>
                <Send color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Meeting Request Modal */}
      <Modal visible={showMeeting} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.meetingBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Live Discovery Call</Text>
              <TouchableOpacity onPress={() => setShowMeeting(false)}>
                <X color="#94a3b8" size={20} />
              </TouchableOpacity>
            </View>

            <Text style={styles.meetingSub}>
              Direct 1-on-1 video call with {brand.brandName} leadership team.
            </Text>

            <Text style={styles.inputLabel}>Your Target Location / Notes</Text>
            <TextInput
              value={meetingNotes}
              onChangeText={setMeetingNotes}
              style={styles.textArea}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.confirmMeetBtn} onPress={handleBookMeeting}>
              <Calendar color="#07090e" size={16} />
              <Text style={styles.confirmMeetText}>Confirm & Book Video Slot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07090e' },
  content: { paddingBottom: 100 },
  banner: { width: '100%', height: 200, backgroundColor: '#020617' },
  brandHeader: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
  logo: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  tagline: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  model: { fontSize: 11, color: '#f59e0b', fontWeight: 'bold', marginTop: 2 },
  metricsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  metricCard: { flex: 1, backgroundColor: '#0d121f', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#1f293d', alignItems: 'center' },
  metricLabel: { fontSize: 8, color: '#64748b', fontWeight: 'bold' },
  metricVal: { fontSize: 11, color: '#10b981', fontWeight: 'bold', marginTop: 2 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  desc: { fontSize: 12, color: '#cbd5e1', lineHeight: 18 },
  cityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0d121f', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#1f293d' },
  cityText: { fontSize: 11, color: '#94a3b8' },
  bottomDock: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0d121f', borderTopWidth: 1, borderTopColor: '#1f293d', padding: 14, flexDirection: 'row', gap: 10 },
  aiDockBtn: { flex: 1, backgroundColor: '#1e293b', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#3b82f644' },
  aiDockText: { color: '#60a5fa', fontSize: 13, fontWeight: 'bold' },
  meetDockBtn: { flex: 1.3, backgroundColor: '#f59e0b', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  meetDockText: { color: '#07090e', fontSize: 13, fontWeight: 'bold' },
  modalBackdrop: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  aiModalBox: { height: '80%', backgroundColor: '#0d121f', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  meetingBox: { backgroundColor: '#0d121f', margin: 16, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1f293d' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  disclaimerPill: { backgroundColor: '#f59e0b15', padding: 8, borderRadius: 10, marginBottom: 10 },
  disclaimerText: { color: '#f59e0b', fontSize: 10, fontWeight: '600' },
  msgScroll: { flex: 1, backgroundColor: '#07090e', borderRadius: 16, marginBottom: 10 },
  bubble: { maxWidth: '85%', borderRadius: 14, padding: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2563eb' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  bubbleText: { color: '#ffffff', fontSize: 12, lineHeight: 17 },
  aiMeetingBtn: { marginTop: 8, backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiMeetingBtnText: { color: '#07090e', fontSize: 10, fontWeight: 'bold' },
  promptScroll: { marginBottom: 10, maxHeight: 35 },
  promptPill: { backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 6 },
  promptText: { color: '#94a3b8', fontSize: 11 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#07090e', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, color: '#ffffff', fontSize: 12, borderWidth: 1, borderColor: '#334155' },
  sendBtn: { backgroundColor: '#2563eb', width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  meetingSub: { fontSize: 12, color: '#94a3b8', marginBottom: 14 },
  inputLabel: { fontSize: 11, color: '#cbd5e1', fontWeight: 'bold', marginBottom: 4 },
  textArea: { backgroundColor: '#07090e', borderRadius: 12, padding: 10, color: '#ffffff', fontSize: 12, borderWidth: 1, borderColor: '#334155', height: 70, marginBottom: 14, textAlignVertical: 'top' },
  confirmMeetBtn: { backgroundColor: '#f59e0b', paddingVertical: 12, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  confirmMeetText: { color: '#07090e', fontSize: 13, fontWeight: 'bold' },
});
