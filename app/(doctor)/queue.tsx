import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
          <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
            <Text style={[styles.patientName, { flexShrink: 1 }]} numberOfLines={1}>{item.patientName}</Text>
            <View style={styles.conditionRow}>
              <Ionicons
                name={isUrgent ? 'alert-circle' : 'medical'}
                size={14}
                color={isUrgent ? '#ef4444' : '#64748b'}
              />
              <Text style={[styles.conditionText, isUrgent && { color: '#ef4444', fontWeight: 'bold' }]}>
                {item.reason}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'in-progress' ? '#f0fdf4' : '#fff7ed', borderColor: item.status === 'in-progress' ? '#10b981' : '#f59e0b' }]}>
            <Text style={[styles.statusText, { color: item.status === 'in-progress' ? '#10b981' : '#f59e0b' }]}>
              {item.status === 'in-progress' ? 'IN PROGRESS' : 'WAITING'}
            </Text>
          </View>
        </View>

        {item.triage && (
          <View style={[styles.triageBadge, { backgroundColor: (triageColor || Colors.light.primary) + '10' }]}>
             <Ionicons name="sparkles" size={12} color={triageColor || Colors.light.primary} />
             <Text style={[styles.triageBadgeText, { color: triageColor || Colors.light.primary }]}>
               AI TRIAGE: {item.triage.triageCategory.toUpperCase()}
             </Text>
          </View>
        )}

        <View style={styles.waitInfo}>
          <Ionicons name="time-outline" size={14} color="#94a3b8" />
          <Text style={styles.waitText}>Est. wait: ~{item.estimatedWaitMinutes} min</Text>
        </View>

        <View style={styles.cardFooter}>
          {item.status === 'waiting' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => item.triage ? handleAccept(item) : updateAppointmentStatus(item.id!, 'in-progress')}
            >
              <Ionicons name={item.triage ? "medical-outline" : "play-circle-outline"} size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>{item.triage ? 'Accept Patient' : 'Call In'}</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in-progress' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={() => updateAppointmentStatus(item.id!, 'done')}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryButtonText}>Mark Processed</Text>
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
          <View style={styles.setupIconCircle}>
            <Ionicons name="business" size={48} color={Colors.light.secondary} />
          </View>
          <Text style={styles.setupTitle}>Connect to Facility</Text>
          <Text style={styles.setupSubtitle}>Please enter the Clinic Name or Hospital ID provided by your administrator to view the live queue.</Text>
          <TextInput
            style={styles.idInput}
            placeholder="e.g. Princess Marina Hospital"
            placeholderTextColor="#94a3b8"
            value={searchInput}
            onChangeText={setSearchInput}
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[styles.connectBtn, !searchInput.trim() && { opacity: 0.5 }]}
            disabled={!searchInput.trim()}
            onPress={() => setHospitalId(searchInput.trim())}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Establish Connection</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
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
            <View style={{ alignItems: 'center', paddingTop: 100 }}>
              <View style={styles.emptyIconCircle}>
                 <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
              </View>
              <Text style={{ marginTop: 20, color: '#1f2937', fontSize: 18, fontWeight: '700' }}>No Active Patients</Text>
              <Text style={{ marginTop: 8, color: '#64748b', fontSize: 14, textAlign: 'center' }}>The patient queue is currently empty for this facility.</Text>
            </View>
          }
        />
      )}

      {/* Doctor Brief Modal */}
      <Modal visible={!!selectedAppointment} animationType="slide" presentationStyle="pageSheet">
        {selectedAppointment?.triage && (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedAppointment(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.modalTitle}>Clinical Profile</Text>
                <Text style={{ color: SEVERITY_COLORS[selectedAppointment.triage.severity], fontWeight: 'bold', fontSize: 13 }}>
                   <Ionicons name="shield-checkmark" size={14} color={SEVERITY_COLORS[selectedAppointment.triage.severity]} /> {selectedAppointment.triage.triageCategory.toUpperCase()}
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
                <Text style={styles.briefLabel}>Clinical Directives</Text>
                {selectedAppointment.triage.recommendedActions.map((a, i) => (
                  <View key={i} style={styles.briefActionRow}>
                    <Ionicons name="checkmark-circle" size={18} color={SEVERITY_COLORS[selectedAppointment.triage!.severity]} />
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  actionButtonText: {
    color: Colors.light.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: Colors.light.secondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  positionBadge: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.light.secondary + '10',
    justifyContent: 'center', alignItems: 'center',
  },
  positionText: { fontSize: 16, fontWeight: '800', color: Colors.light.secondary },
  waitInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, marginBottom: 4 },
  waitText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  setupContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  setupIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.light.secondary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  setupTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  setupSubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  idInput: {
    width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 18,
    fontSize: 16, borderWidth: 2, borderColor: '#e2e8f0', marginBottom: 16,
    color: '#0f172a', fontWeight: '500',
  },
  connectBtn: {
    backgroundColor: Colors.light.secondary, borderRadius: 18,
    paddingVertical: 18, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center',
    shadowColor: Colors.light.secondary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  triageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  triageBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8fafc',
    justifyContent: 'center', alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  briefSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  briefLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  briefValue: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    flex: 1,
    fontWeight: '500',
  },
  briefChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  briefChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  briefChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  briefActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 12,
  },
  urgencyBanner: {
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  urgencyBannerText: {
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1,
  },
  emptyIconCircle: {
     width: 100, height: 100, borderRadius: 50, backgroundColor: '#f8fafc',
     justifyContent: 'center', alignItems: 'center'
  }
});
