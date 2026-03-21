import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TEAL = '#0E7490';

type RxStatus = 'pending' | 'dispensed' | 'rejected';

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  medication: string;
  dosage: string;
  quantity: string;
  notes?: string;
  status: RxStatus;
  createdAt: string;
}

// Local mock data for demo purposes when Firestore is empty
const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'm1', patientName: 'Keabetswe Molefe', doctorName: 'Dr. Thato Selato', medication: 'Amoxicillin 500mg', dosage: '3x/day for 7 days', quantity: '21 capsules', notes: 'Take with food. Patient has no known penicillin allergy.', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'm2', patientName: 'Mpho Sithole', doctorName: 'Dr. Kagiso Dube', medication: 'Metformin 500mg', dosage: '2x/day (ongoing)', quantity: '60 tablets', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'm3', patientName: 'Boitumelo Kgosi', doctorName: 'Dr. Thato Selato', medication: 'Omeprazole 20mg', dosage: '1x/day before meals', quantity: '30 capsules', status: 'dispensed', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'm4', patientName: 'Tshegofatso Moyo', doctorName: 'Dr. Kagiso Dube', medication: 'Ibuprofen 400mg', dosage: 'PRN (as needed)', quantity: '20 tablets', notes: 'Avoid if GI discomfort develops.', status: 'rejected', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const STATUS_COLORS: Record<RxStatus, string> = {
  pending: '#f59e0b',
  dispensed: '#10b981',
  rejected: '#ef4444',
};

const STATUS_ICONS: Record<RxStatus, string> = {
  pending: 'clock',
  dispensed: 'check-circle',
  rejected: 'times-circle',
};

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [filter, setFilter] = useState<RxStatus | 'all'>('all');
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe to Firestore prescriptions; fall back to mock if empty
    const unsub = onSnapshot(collection(db, 'prescriptions'), (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription));
        setPrescriptions(data);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = filter === 'all' ? prescriptions : prescriptions.filter(p => p.status === filter);

  const updateStatus = async (id: string, status: RxStatus) => {
    // Update local state (and Firestore if real doc)
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    setSelected(prev => prev ? { ...prev, status } : null);
    try {
      if (!id.startsWith('m')) {
        await updateDoc(doc(db, 'prescriptions', id), { status });
      }
    } catch (_) {}
    Alert.alert('Updated', `Prescription marked as ${status}.`);
    setSelected(null);
  };

  const FILTERS: Array<RxStatus | 'all'> = ['all', 'pending', 'dispensed', 'rejected'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Prescriptions</Text>
        <Text style={styles.subtitle}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientName}>{item.patientName}</Text>
                  <Text style={styles.doctorName}>{item.doctorName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                  <FontAwesome5 name={STATUS_ICONS[item.status]} size={12} color={STATUS_COLORS[item.status]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.medRow}>
                <FontAwesome5 name="pills" size={14} color={TEAL} />
                <Text style={styles.medText}>{item.medication}</Text>
              </View>
              <Text style={styles.dosageText}>{item.dosage} · Qty: {item.quantity}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <FontAwesome5 name="file-prescription" size={48} color="#cbd5e1" />
              <Text style={{ marginTop: 16, color: '#64748b', fontSize: 16 }}>No prescriptions found</Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet">
        {selected && (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f9ff' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <FontAwesome5 name="times" size={22} color="#334155" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Prescription Details</Text>
              <View style={{ width: 22 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 14 }}>
              {[
                { label: 'Patient', value: selected.patientName, icon: 'user' },
                { label: 'Prescribed By', value: selected.doctorName, icon: 'user-md' },
                { label: 'Medication', value: selected.medication, icon: 'pills' },
                { label: 'Dosage', value: selected.dosage, icon: 'clock' },
                { label: 'Quantity', value: selected.quantity, icon: 'boxes' },
                ...(selected.notes ? [{ label: 'Notes', value: selected.notes, icon: 'sticky-note' }] : []),
              ].map(row => (
                <View key={row.label} style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <FontAwesome5 name={row.icon} size={16} color={TEAL} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={styles.detailValue}>{row.value}</Text>
                  </View>
                </View>
              ))}

              {selected.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                    onPress={() => updateStatus(selected.id, 'dispensed')}
                  >
                    <FontAwesome5 name="check" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Mark Dispensed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                    onPress={() => updateStatus(selected.id, 'rejected')}
                  >
                    <FontAwesome5 name="times" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: { padding: 20, backgroundColor: TEAL, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#a5f3fc', marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0' },
  chipActive: { backgroundColor: TEAL },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  patientName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  doctorName: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  medText: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  dosageText: { fontSize: 13, color: '#64748b' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  detailRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 14, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 15, color: '#334155', lineHeight: 22 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
