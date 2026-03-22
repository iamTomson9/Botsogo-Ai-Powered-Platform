import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

const TEAL = '#0E7490';

export default function PharmacistDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const stats = [
    { title: 'Orders Pending', count: '12', icon: 'clipboard-outline', color: '#f59e0b' },
    { title: 'Dispensed Today', count: '45', icon: 'checkmark-done-circle-outline', color: '#10b981' },
    { title: 'Stock Alerts', count: '4', icon: 'alert-circle-outline', color: '#ef4444' },
  ];

  const quickActions = [
    { label: 'Orders', icon: 'clipboard-outline', route: '/(pharmacist)/prescriptions' },
    { label: 'Inventory', icon: 'cube-outline', route: '/(pharmacist)/inventory' },
    { label: 'Logistics', icon: 'swap-horizontal-outline', route: '/(pharmacist)/requests' },
    { label: 'Security', icon: 'shield-checkmark-outline', route: '/(pharmacist)/index' },
  ];

  const alerts = [
    { patient: 'Keabetswe M.', drug: 'Warfarin + Aspirin', note: 'Potential bleeding risk – verify with prescribing doctor.' },
    { patient: 'Thato B.', drug: 'Metformin', note: 'Refill requested. Last dispensed 28 days ago.' },
    { patient: 'Mpho S.', drug: 'Amoxicillin', note: 'Allergy flag: patient history notes penicillin sensitivity.' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>PORTAL ACCESS</Text>
            <Text style={styles.name}>{user?.name ?? 'Head Pharmacist'}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.pillIcon}>
            <Ionicons name="medical" size={36} color="#fff" />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s, idx) => (
            <View key={s.title} style={[styles.statCard, idx === 0 && { flex: 1.2 }]}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={styles.statCount}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Facility Control</Text>
        <View style={styles.actionGrid}>
          {quickActions.map(a => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              onPress={() => router.push(a.route as any)}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name={a.icon as any} size={24} color={TEAL} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Drug Interaction Alerts */}
        <Text style={styles.sectionTitle}>Clinical Safety Alerts</Text>
        {alerts.map((a, i) => (
          <View key={i} style={styles.alertCard}>
            <View style={styles.alertIconWrap}>
              <Ionicons name="warning-outline" size={20} color={i === 0 ? '#ef4444' : TEAL} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertPatient}>{a.patient}</Text>
                <View style={[styles.drugTag, i === 0 && { backgroundColor: '#fee2e2' }]}>
                  <Text style={[styles.drugTagText, i === 0 && { color: '#ef4444' }]}>{a.drug}</Text>
                </View>
              </View>
              <Text style={styles.alertNote}>{a.note}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  content: { padding: 20, paddingBottom: 32 },
  headerCard: {
    backgroundColor: TEAL,
    borderRadius: 32,
    padding: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  headerLeft: {},
  greeting: { color: '#a5f3fc', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  name: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  date: { color: '#bae6fd', fontSize: 13, marginTop: 6, opacity: 0.8 },
  pillIcon: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    transform: [{ rotate: '15deg' }],
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 18,
    alignItems: 'flex-start',
    shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
  },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statCount: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: '#0f172a', marginBottom: 16, letterSpacing: -0.5 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 32 },
  actionCard: {
    width: '47.8%', backgroundColor: '#fff', borderRadius: 24, padding: 22,
    alignItems: 'center',
    shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3,
  },
  actionIconWrap: {
    width: 52, height: 52, borderRadius: 18,
    backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  actionLabel: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24, padding: 18, marginBottom: 14,
    shadowColor: '#0f172a', shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    gap: 14,
  },
  alertIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center',
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  alertPatient: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  drugTag: { backgroundColor: '#f0f9ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  drugTagText: { fontSize: 10, fontWeight: '900', color: TEAL, letterSpacing: 0.5 },
  alertNote: { fontSize: 13, color: '#64748b', lineHeight: 20, fontWeight: '500' },
});
