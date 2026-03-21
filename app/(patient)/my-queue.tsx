import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToPatientQueue, Appointment } from '../../services/appointmentService';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  waiting:     { label: 'Waiting',     color: '#f59e0b', icon: 'clock' },
  'in-progress': { label: 'In Progress', color: '#10b981', icon: 'stethoscope' },
  done:        { label: 'Done',        color: '#6366f1', icon: 'check-circle' },
  cancelled:   { label: 'Cancelled',   color: '#ef4444', icon: 'times-circle' },
};

export default function MyQueue() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToPatientQueue(user.uid, (data) => {
      setAppointments(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const renderCard = ({ item }: { item: Appointment }) => {
    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.waiting;
    const waitText = item.status === 'waiting'
      ? `~${item.estimatedWaitMinutes} min wait`
      : cfg.label;

    return (
      <View style={styles.card}>
        {/* Hospital Header */}
        <View style={styles.cardHeader}>
          <View style={styles.hospitalIcon}>
            <FontAwesome5 name="hospital" size={22} color={Colors.light.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hospitalName}>{item.hospitalName}</Text>
            <Text style={styles.reason}>{item.reason}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.color + '20', borderColor: cfg.color }]}>
            <FontAwesome5 name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Queue Info */}
        {item.status === 'waiting' && (
          <View style={styles.queueInfoRow}>
            <View style={styles.queueStat}>
              <Text style={styles.queueStatLabel}>Queue Position</Text>
              <Text style={styles.queueStatValue}>#{item.queuePosition}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.queueStat}>
              <Text style={styles.queueStatLabel}>Est. Wait Time</Text>
              <Text style={[styles.queueStatValue, { color: Colors.light.primary }]}>{waitText}</Text>
            </View>
          </View>
        )}

        {item.status === 'in-progress' && (
          <View style={[styles.queueInfoRow, { backgroundColor: '#d1fae5', borderRadius: 12, marginTop: 12, padding: 12, justifyContent: 'center', alignItems: 'center' }]}>
            <FontAwesome5 name="stethoscope" size={16} color="#10b981" />
            <Text style={{ marginLeft: 8, color: '#10b981', fontWeight: '700', fontSize: 15 }}>You are currently being seen!</Text>
          </View>
        )}

        {/* Booking time */}
        <Text style={styles.bookedAt}>
          Booked at {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'loading...'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Queue</Text>
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="calendar-times" size={56} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No active appointments</Text>
          <Text style={styles.emptySubtitle}>Book an appointment at a nearby hospital to get started.</Text>
          <TouchableOpacity style={styles.bookNowBtn} onPress={() => router.push('/(patient)/book-appointment' as any)}>
            <FontAwesome5 name="calendar-plus" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Book Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={item => item.id!}
          renderItem={renderCard}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.primary, paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07,
    shadowRadius: 10, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hospitalIcon: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#e0f2fe',
    justifyContent: 'center', alignItems: 'center',
  },
  hospitalName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  reason: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  queueInfoRow: {
    flexDirection: 'row', marginTop: 16,
    backgroundColor: '#f8fafc', borderRadius: 14, padding: 14,
  },
  queueStat: { flex: 1, alignItems: 'center' },
  queueStatLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  queueStatValue: { fontSize: 26, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  divider: { width: 1, backgroundColor: '#e2e8f0', marginVertical: 4 },
  bookedAt: { fontSize: 12, color: '#94a3b8', marginTop: 12, textAlign: 'right' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#334155', marginTop: 16 },
  emptySubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  bookNowBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.primary, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 24,
  },
});
