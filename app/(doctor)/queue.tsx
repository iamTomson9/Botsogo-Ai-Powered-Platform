import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToHospitalQueue, updateAppointmentStatus, Appointment } from '../../services/appointmentService';

export default function PatientQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [hospitalId, setHospitalId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hospitalId) return;
    setLoading(true);
    const unsub = subscribeToHospitalQueue(hospitalId, (data) => {
      setQueue(data);
      setLoading(false);
    });
    return () => unsub();
  }, [hospitalId]);

  const renderPatient = ({ item }: { item: Appointment }) => {
    const isUrgent = item.reason.toLowerCase().includes('chest') ||
      item.reason.toLowerCase().includes('breath') ||
      item.reason.toLowerCase().includes('pain');

    return (
      <View style={[styles.card, isUrgent && styles.cardHighPriority]}>
        <View style={styles.cardHeader}>
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>#{item.queuePosition}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.patientName}>{item.patientName}</Text>
            <View style={styles.conditionRow}>
              <FontAwesome5
                name={isUrgent ? 'exclamation-circle' : 'stethoscope'}
                size={12}
                color={isUrgent ? '#ef4444' : '#64748b'}
              />
              <Text style={[styles.conditionText, isUrgent && { color: '#ef4444', fontWeight: 'bold' }]}>
                {item.reason}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { borderColor: item.status === 'in-progress' ? '#10b981' : '#f59e0b' }]}>
            <Text style={[styles.statusText, { color: item.status === 'in-progress' ? '#10b981' : '#f59e0b' }]}>
              {item.status === 'in-progress' ? '● IN PROGRESS' : '● WAITING'}
            </Text>
          </View>
        </View>

        <View style={styles.waitInfo}>
          <FontAwesome5 name="clock" size={12} color="#94a3b8" />
          <Text style={styles.waitText}>Est. wait: ~{item.estimatedWaitMinutes} min</Text>
        </View>

        <View style={styles.cardFooter}>
          {item.status === 'waiting' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => updateAppointmentStatus(item.id!, 'in-progress')}
            >
              <FontAwesome5 name="play-circle" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>Call In</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in-progress' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={() => updateAppointmentStatus(item.id!, 'done')}
            >
              <FontAwesome5 name="check-circle" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>Mark Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Queue</Text>
        <Text style={styles.subtitle}>
          {hospitalId
            ? `${queue.filter(q => q.status === 'waiting').length} waiting • ${queue.filter(q => q.status === 'in-progress').length} in progress`
            : 'Enter your hospital ID to begin'}
        </Text>
      </View>

      {/* Hospital ID lookup */}
      {!hospitalId ? (
        <View style={styles.setupContainer}>
          <FontAwesome5 name="hospital" size={48} color="#cbd5e1" />
          <Text style={styles.setupTitle}>Enter Your Hospital ID</Text>
          <Text style={styles.setupSubtitle}>This is the clinic name or ID from the booking system.</Text>
          <TextInput
            style={styles.idInput}
            placeholder="e.g. Princess Marina Hospital"
            value={searchInput}
            onChangeText={setSearchInput}
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[styles.connectBtn, !searchInput.trim() && { opacity: 0.5 }]}
            disabled={!searchInput.trim()}
            onPress={() => setHospitalId(searchInput.trim())}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Connect to Queue</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color={Colors.light.secondary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={queue}
          keyExtractor={item => item.id!}
          renderItem={renderPatient}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <FontAwesome5 name="clipboard-check" size={48} color="#cbd5e1" />
              <Text style={{ marginTop: 16, color: '#64748b', fontSize: 16 }}>No active patients in queue</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.secondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccfbf1',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHighPriority: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  timeTag: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conditionText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#475569',
  },
  statusBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.light.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: Colors.light.secondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  positionBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.light.secondary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  positionText: { fontSize: 15, fontWeight: 'bold', color: Colors.light.secondary },
  waitInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 4 },
  waitText: { fontSize: 13, color: '#94a3b8' },
  setupContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 12 },
  setupTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginTop: 16 },
  setupSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 8 },
  idInput: {
    width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 16,
    fontSize: 16, borderWidth: 1.5, borderColor: '#e2e8f0', marginTop: 8,
  },
  connectBtn: {
    backgroundColor: Colors.light.secondary, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 32, marginTop: 12,
  },
});
