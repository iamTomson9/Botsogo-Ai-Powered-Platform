import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToHospitalQueue, updateAppointmentStatus, acceptAppointment, Appointment } from '../../services/appointmentService';

export default function PatientQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [hospitalId, setHospitalId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const SEVERITY_COLORS: Record<string, string> = {
    low: '#10b981',
    moderate: '#f59e0b',
    high: '#ef4444',
    critical: '#b91c1c',
    clinical: '#6d28d9',
  };

  const handleAccept = async (appointment: Appointment) => {
    if (!user) return;
    try {
      await acceptAppointment(appointment.id!, user.uid, user.displayName || 'Doctor');
    } catch (err) {
      console.error("Error accepting appointment:", err);
    }
  };

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
      item.reason.toLowerCase().includes('pain') ||
      item.triage?.severity === 'critical' || item.triage?.severity === 'high';

    const triageColor = item.triage ? (SEVERITY_COLORS[item.triage.severity] || Colors.light.primary) : null;

    return (
      <TouchableOpacity 
        style={[styles.card, isUrgent && styles.cardHighPriority]}
        onPress={() => item.triage && setSelectedAppointment(item)}
      >
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

        {item.triage && (
          <View style={[styles.triageBadge, { backgroundColor: (triageColor || Colors.light.primary) + '20' }]}>
             <FontAwesome5 name="robot" size={10} color={triageColor || Colors.light.primary} />
             <Text style={[styles.triageBadgeText, { color: triageColor || Colors.light.primary }]}>
               AI TRIAGE: {item.triage.triageCategory.toUpperCase()}
             </Text>
          </View>
        )}

        <View style={styles.waitInfo}>
          <FontAwesome5 name="clock" size={12} color="#94a3b8" />
          <Text style={styles.waitText}>Est. wait: ~{item.estimatedWaitMinutes} min</Text>
        </View>

        <View style={styles.cardFooter}>
          {item.status === 'waiting' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => item.triage ? handleAccept(item) : updateAppointmentStatus(item.id!, 'in-progress')}
            >
              <FontAwesome5 name={item.triage ? "hand-holding-medical" : "play-circle"} size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>{item.triage ? 'Accept Patient' : 'Call In'}</Text>
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
      </TouchableOpacity>
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

      {/* Doctor Brief Modal */}
      <Modal visible={!!selectedAppointment} animationType="slide" presentationStyle="pageSheet">
        {selectedAppointment?.triage && (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedAppointment(null)}>
                <FontAwesome5 name="times" size={22} color="#334155" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.modalTitle}>Clinical Brief</Text>
                <Text style={{ color: SEVERITY_COLORS[selectedAppointment.triage.severity], fontWeight: 'bold' }}>
                  {selectedAppointment.triage.triageCategory}
                </Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
              <View style={styles.briefSection}>
                <Text style={styles.briefLabel}>Patient Details</Text>
                <Text style={styles.briefValue}>
                  {selectedAppointment.patientName} • {selectedAppointment.triage.patientAge} yrs • {selectedAppointment.triage.patientGender}
                </Text>
              </View>

              <View style={styles.briefSection}>
                <Text style={styles.briefLabel}>Patient Summary</Text>
                <Text style={styles.briefValue}>{selectedAppointment.triage.patientSummary}</Text>
              </View>

              <View style={styles.briefSection}>
                <Text style={styles.briefLabel}>Chief Complaint</Text>
                <Text style={styles.briefValue}>{selectedAppointment.triage.chiefComplaint}</Text>
              </View>

              <View style={styles.briefSection}>
                <Text style={styles.briefLabel}>Recommended Screenings</Text>
                <View style={styles.briefChipRow}>
                  {selectedAppointment.triage.recommendedScreenings.map((s, i) => (
                    <View key={i} style={styles.briefChip}>
                      <Text style={styles.briefChipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.briefSection}>
                <Text style={styles.briefLabel}>Doctor Recommended Actions</Text>
                {selectedAppointment.triage.recommendedActions.map((a, i) => (
                  <View key={i} style={styles.briefActionRow}>
                    <FontAwesome5 name="check-circle" size={14} color={SEVERITY_COLORS[selectedAppointment.triage!.severity]} />
                    <Text style={styles.briefValue}>{a}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.urgencyBanner, { backgroundColor: SEVERITY_COLORS[selectedAppointment.triage.severity] + '10' }]}>
                <Text style={[styles.urgencyBannerText, { color: SEVERITY_COLORS[selectedAppointment.triage.severity] }]}>
                  STATUS: {selectedAppointment.triage.urgency.toUpperCase()}
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
  triageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  triageBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  briefSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  briefLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  briefValue: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    flex: 1,
  },
  briefChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  briefChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  briefChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  briefActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  urgencyBanner: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  urgencyBannerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
