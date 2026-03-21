import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

const TEAL = '#0E7490';

export default function PharmacistDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const stats = [
    { title: 'Pending Rx', count: '8', icon: 'file-prescription', color: '#f59e0b' },
    { title: 'Dispensed Today', count: '24', icon: 'capsules', color: TEAL },
    { title: 'Low Stock Alerts', count: '3', icon: 'exclamation-triangle', color: '#ef4444' },
  ];

  const quickActions = [
    { label: 'Prescriptions', icon: 'file-prescription', route: '/(pharmacist)/prescriptions' },
    { label: 'Dispense', icon: 'capsules', route: '/(pharmacist)/dispense' },
    { label: 'Inventory', icon: 'boxes', route: '/(pharmacist)/inventory' },
    { label: 'Messages', icon: 'envelope', route: '/(pharmacist)/messages' },
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
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user?.name ?? 'Pharmacist'}</Text>
            <Text style={styles.date}>{new Date().toDateString()}</Text>
          </View>
          <View style={styles.pillIcon}>
            <FontAwesome5 name="pills" size={32} color="#fff" />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.title} style={[styles.statCard, { borderTopColor: s.color }]}>
              <FontAwesome5 name={s.icon} size={20} color={s.color} />
              <Text style={styles.statCount}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {quickActions.map(a => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              onPress={() => router.push(a.route as any)}
            >
              <View style={styles.actionIconWrap}>
                <FontAwesome5 name={a.icon} size={22} color={TEAL} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Drug Interaction Alerts */}
        <Text style={styles.sectionTitle}>AI Drug Alerts</Text>
        {alerts.map((a, i) => (
          <View key={i} style={styles.alertCard}>
            <View style={styles.alertIconWrap}>
              <FontAwesome5 name="robot" size={18} color={TEAL} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertPatient}>{a.patient}</Text>
                <View style={styles.drugTag}>
                  <Text style={styles.drugTagText}>{a.drug}</Text>
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
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  headerLeft: {},
  greeting: { color: '#a5f3fc', fontSize: 14, fontWeight: '500' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  date: { color: '#bae6fd', fontSize: 13, marginTop: 4 },
  pillIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14,
    alignItems: 'center', borderTopWidth: 3,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statCount: { fontSize: 26, fontWeight: 'bold', color: '#0f172a', marginTop: 8 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 14 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  actionCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 18, padding: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  actionIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: TEAL,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    gap: 12,
  },
  alertIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center',
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  alertPatient: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  drugTag: { backgroundColor: '#e0f2fe', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  drugTagText: { fontSize: 11, fontWeight: '700', color: TEAL },
  alertNote: { fontSize: 13, color: '#475569', lineHeight: 19 },
});
