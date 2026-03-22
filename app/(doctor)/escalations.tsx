import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { acceptAppointment } from '../../services/appointmentService';

type Escalation = {
  id: string;
  patientId: string;
  patientName: string;
  summary: string;
  severity: 'low' | 'moderate' | 'medium' | 'high' | 'critical' | 'clinical';
  status: 'pending' | 'acknowledged' | 'resolved';
  appointmentId?: string;
  hospitalName?: string;
  aiChatHistory?: { role: string; content: string }[];
  createdAt: any;
};

const SEVERITY_CONFIG = {
  high:     { color: '#ef4444', bg: '#fef2f2', icon: 'alert-circle', label: 'HIGH RISK' },
  medium:   { color: '#f59e0b', bg: '#fefce8', icon: 'warning', label: 'MEDIUM RISK' },
  low:      { color: '#10b981', bg: '#f0fdf4', icon: 'information-circle', label: 'LOW RISK' },
  critical: { color: '#7f1d1d', bg: '#fef2f2', icon: 'skull', label: 'CRITICAL' },
  clinical: { color: '#991b1b', bg: '#fef2f2', icon: 'medical', label: 'CLINICAL' },
  moderate: { color: '#f59e0b', bg: '#fefce8', icon: 'warning', label: 'MODERATE' },
};

const getSeverityCfg = (severity: string) => {
  return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.low;
};

export default function Escalations() {
  const router = useRouter();
  const { user } = useAuth();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Escalation | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'escalations'),
      where('status', 'in', ['pending', 'acknowledged'])
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Escalation));
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setEscalations(data);
      setLoading(false);
    }, (err) => {
      console.error("Escalation subscription error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const acknowledge = async (escalation: Escalation) => {
    if (!escalation.id.startsWith('demo')) {
      await updateDoc(doc(db, 'escalations', escalation.id), { status: 'acknowledged' });
    }
    setEscalations(prev => prev.map(e => e.id === escalation.id ? { ...e, status: 'acknowledged' } : e));
    setSelected(null);
  };

  const resolve = async (escalation: Escalation) => {
    if (!escalation.id.startsWith('demo')) {
      await updateDoc(doc(db, 'escalations', escalation.id), { status: 'resolved' });
    }
    setEscalations(prev => prev.filter(e => e.id !== escalation.id));
    setSelected(null);
  };

  const handleAcceptAppointment = async (escalation: Escalation) => {
    if (!user || !escalation.appointmentId) return;
    
    try {
      await acceptAppointment(escalation.appointmentId, user.uid, user.name || user.displayName || 'Doctor');
      await updateDoc(doc(db, 'escalations', escalation.id), { status: 'acknowledged' });
      setSelected(null);
      router.push({ 
        pathname: '/(doctor)/chat/[id]', 
        params: { id: escalation.patientId, name: escalation.patientName } 
      } as any);
    } catch (err) {
      console.error("Error accepting from escalation dashboard:", err);
    }
  };

  const renderCard = ({ item }: { item: Escalation }) => {
    const cfg = getSeverityCfg(item.severity);
    return (
      <TouchableOpacity style={[styles.card, { borderLeftColor: cfg.color }]} onPress={() => setSelected(item)}>
        <View style={styles.cardTop}>
          <View style={[styles.severityBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
            <Text style={[styles.severityText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.timeText}>
            {item.status === 'acknowledged' ? '✓ Acknowledged' : '• New'}
          </Text>
        </View>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.summaryPreview} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.viewText}>Review Case</Text>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Escalated Cases</Text>
        <Text style={styles.subtitle}>{escalations.length} active cases requiring review</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.secondary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={escalations}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 100, gap: 16 }}>
              <View style={styles.emptyIconCircle}>
                 <Ionicons name="checkmark-done" size={48} color="#10b981" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>All Caught Up!</Text>
              <Text style={{ color: '#6b7280', textAlign: 'center', paddingHorizontal: 40 }}>No escalated cases requiring immediate attention at this moment.</Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
        {selected && (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Clinical Review</Text>
              <View style={{ width: 44 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityCfg(selected.severity).bg, alignSelf: 'flex-start' }]}>
                <Ionicons name={getSeverityCfg(selected.severity).icon as any} size={16} color={getSeverityCfg(selected.severity).color} />
                <Text style={[styles.severityText, { color: getSeverityCfg(selected.severity).color, fontSize: 13 }]}>
                  {getSeverityCfg(selected.severity).label}
                </Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{selected.patientName}</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>AI Summary</Text>
                <Text style={{ fontSize: 16, lineHeight: 26, color: '#334155' }}>{selected.summary}</Text>
                {selected.hospitalName && (
                  <Text style={{ fontSize: 13, color: Colors.light.secondary, fontWeight: '600', marginTop: 12 }}>
                    📍 Assigned: {selected.hospitalName}
                  </Text>
                )}
              </View>

              {selected.aiChatHistory && selected.aiChatHistory.length > 0 && (
                <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase' }}>AI Chat Transcript</Text>
                  {selected.aiChatHistory.map((msg: any, idx: number) => (
                    <View key={idx} style={[
                      styles.msgBubble, 
                      msg.role === 'user' ? styles.userBubble : styles.aiBubble
                    ]}>
                      <Text style={[
                        styles.msgText,
                        msg.role === 'user' ? styles.userText : styles.aiText
                      ]}>{msg.content}</Text>
                    </View>
                  ))}
                </View>
              )}
              {selected.appointmentId && (
                <TouchableOpacity
                  style={[styles.modalActionBtn, { backgroundColor: '#3b82f6' }]}
                  onPress={() => handleAcceptAppointment(selected)}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.modalActionText}>Join Consultation Room</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: Colors.light.secondary }]}
                onPress={() => acknowledge(selected)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.modalActionText}>Acknowledge Case</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: '#10b981' }]}
                onPress={() => resolve(selected)}
              >
                <Ionicons name="flag-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.modalActionText}>Mark as Resolved</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: Colors.light.secondary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#ccfbf1', marginTop: 4, fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 16,
    borderLeftWidth: 6, shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  severityText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  timeText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  patientName: { fontSize: 19, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  summaryPreview: { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '400' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 16, gap: 4 },
  viewText: { fontSize: 13, color: Colors.light.secondary, fontWeight: '700' },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  modalActionBtn: { flexDirection: 'row', borderRadius: 18, paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalActionText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  msgBubble: { padding: 14, borderRadius: 18, marginBottom: 10, maxWidth: '85%' },
  userBubble: { backgroundColor: Colors.light.primary + '10', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#f8fafc', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  msgText: { fontSize: 14, lineHeight: 22 },
  userText: { color: Colors.light.primary, fontWeight: '600' },
  aiText: { color: '#334155' },
});
