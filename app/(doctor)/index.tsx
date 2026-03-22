import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function DoctorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({ waiting: 0, urgent: 0, today: 0 });
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // 1. Listen for waiting/consulting patients
    const qWaiting = query(collection(db, 'appointments'), where('status', 'in', ['waiting', 'consulting']));
    const unsubWaiting = onSnapshot(qWaiting, (snap) => {
      const waiting = snap.docs.filter(d => d.data().status === 'waiting').length;
      setStats(prev => ({ ...prev, waiting }));
    });

    // 2. Listen for escalated/urgent cases
    const qUrgent = query(collection(db, 'appointments'), where('status', '==', 'escalated'));
    const unsubUrgent = onSnapshot(qUrgent, (snap) => {
      const urgent = snap.size;
      setStats(prev => ({ ...prev, urgent }));
      setEscalations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    setLoading(false);
    return () => {
      unsubWaiting();
      unsubUrgent();
    };
  }, []);

  const StatCard = ({ title, count, icon, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <FontAwesome5 name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.drName}>Dr. {user?.name || 'Practitioner'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#0f172a" />
            {stats.urgent > 0 && <View style={styles.notifBadge} />}
          </TouchableOpacity>
        </View>

        {escalations.length > 0 && (
          <View style={styles.spotlight}>
            <View style={styles.spotlightHeader}>
              <View style={styles.urgentBadge}>
                <MaterialCommunityIcons name="alert-decagram" size={14} color="#fff" />
                <Text style={styles.urgentBadgeText}>URGENT ESCALATION</Text>
              </View>
              <Text style={styles.spotlightTime}>Just now</Text>
            </View>
            <Text style={styles.spotlightTitle}>Patient #{escalations[0].id.slice(-4).toUpperCase()}</Text>
            <Text style={styles.spotlightDesc} numberOfLines={2}>
              {escalations[0].reason || 'High severity symptoms reported via AI Triage.'}
            </Text>
            <TouchableOpacity 
              style={styles.spotlightAction}
              onPress={() => router.push('/(doctor)/escalations')}
            >
              <Text style={styles.spotlightActionText}>Review & Join</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bentoGrid}>
          <View style={[styles.bentoCol, { width: '100%' }]}>
            <StatCard 
              title="Patients in Queue" 
              count={stats.waiting} 
              icon="users" 
              color="#3b82f6" 
              subtitle="Average wait: 12m"
            />
          </View>
          <View style={styles.bentoRow}>
            <TouchableOpacity 
              style={[styles.smallCard, { backgroundColor: '#fee2e2' }]}
              onPress={() => router.push('/(doctor)/escalations')}
            >
              <MaterialCommunityIcons name="alert-circle" size={28} color="#ef4444" />
              <Text style={styles.smallCardCount}>{stats.urgent}</Text>
              <Text style={styles.smallCardTitle}>Urgent</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.smallCard, { backgroundColor: '#f0fdf4' }]}
              onPress={() => router.push('/(doctor)/queue')}
            >
              <MaterialCommunityIcons name="check-all" size={28} color="#10b981" />
              <Text style={styles.smallCardCount}>{stats.today}</Text>
              <Text style={styles.smallCardTitle}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {[
            { label: 'Live Queue', icon: 'clipboard-list', route: '/(doctor)/queue', color: '#6366f1' },
            { label: 'Diagnostics', icon: 'x-ray', route: '/(doctor)/diagnostics', color: '#a855f7' },
            { label: 'Medications', icon: 'pills', route: '/(doctor)/medications', color: '#ec4899' },
            { label: 'Transcription', icon: 'microphone', route: '/(doctor)/transcription', color: '#f59e0b' },
          ].map((action, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.actionBtn}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <FontAwesome5 name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.light.secondary} />
          <Text style={styles.tipText}>
            Use the **Transcription** tool for in-person consultations to automatically update patient history.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greeting: { fontSize: 16, color: '#64748b', fontWeight: '500' },
  drName: { fontSize: 24, fontWeight: '700', color: '#0f172a' },
  notificationBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  notifBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#fff' },
  spotlight: { backgroundColor: '#0f172a', borderRadius: 24, padding: 20, marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  spotlightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  urgentBadge: { backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  urgentBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  spotlightTime: { color: '#64748b', fontSize: 11 },
  spotlightTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  spotlightDesc: { color: '#94a3b8', fontSize: 14, lineHeight: 20, marginBottom: 16 },
  spotlightAction: { backgroundColor: Colors.light.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 16, gap: 8 },
  spotlightActionText: { color: '#fff', fontWeight: '700' },
  bentoGrid: { gap: 16, marginBottom: 32 },
  bentoCol: { },
  bentoRow: { flexDirection: 'row', gap: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statCount: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  statTitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  statSubtitle: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  smallCard: { flex: 1, borderRadius: 24, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 4 },
  smallCardCount: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  smallCardTitle: { fontSize: 12, fontWeight: '600', color: '#475569' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  actionBtn: { width: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  actionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
  tipCard: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },
  tipText: { flex: 1, fontSize: 13, color: '#64748b', lineHeight: 18 },
});
