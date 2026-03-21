import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
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
  high:     { color: '#ef4444', bg: '#fef2f2', icon: 'exclamation-circle', label: 'HIGH RISK' },
  medium:   { color: '#f59e0b', bg: '#fefce8', icon: 'exclamation-triangle', label: 'MEDIUM RISK' },
  low:      { color: '#10b981', bg: '#f0fdf4', icon: 'info-circle', label: 'LOW RISK' },
  critical: { color: '#7f1d1d', bg: '#fef2f2', icon: 'dizzy', label: 'CRITICAL' },
  clinical: { color: '#991b1b', bg: '#fef2f2', icon: 'procedures', label: 'CLINICAL' },
  moderate: { color: '#f59e0b', bg: '#fefce8', icon: 'exclamation-triangle', label: 'MODERATE' },
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
            <FontAwesome5 name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.severityText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.timeText}>
            {item.status === 'acknowledged' ? '✓ Acknowledged' : '● New'}
          </Text>
        </View>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.summaryPreview} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.cardFooter}>
          <FontAwesome5 name="chevron-right" size={14} color="#94a3b8" />
          <Text style={styles.viewText}>Tap to review</Text>
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
            <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
              <FontAwesome5 name="check-circle" size={56} color="#86efac" />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#334155' }}>All Clear!</Text>
              <Text style={{ color: '#64748b' }}>No escalated cases at this time.</Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
        {selected && (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <FontAwesome5 name="times" size={22} color="#334155" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Case Details</Text>
              <View style={{ width: 22 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityCfg(selected.severity).bg, alignSelf: 'flex-start' }]}>
                <FontAwesome5 name={getSeverityCfg(selected.severity).icon} size={14} color={getSeverityCfg(selected.severity).color} />
                <Text style={[styles.severityText, { color: getSeverityCfg(selected.severity).color, fontSize: 14 }]}>
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
                  style={{ backgroundColor: '#3b82f6', borderRadius: 16, padding: 18, alignItems: 'center' }}
                  onPress={() => handleAcceptAppointment(selected)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Accept Appointment & Join Chat</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{ backgroundColor: Colors.light.secondary, borderRadius: 16, padding: 18, alignItems: 'center' }}
                onPress={() => acknowledge(selected)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Acknowledge Case</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#10b981', borderRadius: 16, padding: 18, alignItems: 'center' }}
                onPress={() => resolve(selected)}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Mark as Resolved</Text>
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
  subtitle: { fontSize: 14, color: '#ccfbf1', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14,
    borderLeftWidth: 5, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  severityText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  timeText: { fontSize: 12, color: '#94a3b8' },
  patientName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  summaryPreview: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, gap: 4 },
  viewText: { fontSize: 13, color: '#94a3b8' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  msgBubble: { padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: '90%' },
  userBubble: { backgroundColor: Colors.light.primary + '15', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  msgText: { fontSize: 14, lineHeight: 20 },
  userText: { color: Colors.light.primary, fontWeight: '500' },
  aiText: { color: '#475569' },
});
