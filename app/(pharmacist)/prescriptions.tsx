import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Modal, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { dispenseMedication } from '../../services/inventoryService';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

const TEAL = '#0E7490';

type RxStatus = 'pending' | 'dispensed' | 'rejected';

interface RxItem {
  medicationId: string;
  name: string;
  quantity: number;
  unit: string;
  instructions: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName?: string; // We'll try to resolve this if available, or use patientId
  doctorName: string;
  diagnosis: string;
  items: RxItem[];
  status: RxStatus;
  createdAt: any;
}

// Local mock data updated to match real structure
const MOCK_PRESCRIPTIONS: Prescription[] = [
  { 
    id: 'm1', 
    patientName: 'Keabetswe Molefe', 
    patientId: 'p1',
    doctorName: 'Dr. Thato Selato', 
    diagnosis: 'Acute Respiratory Infection',
    items: [
      { medicationId: '1', name: 'Amoxicillin 500mg', quantity: 21, unit: 'capsules', instructions: '3x/day for 7 days' }
    ],
    status: 'pending', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'm2', 
    patientName: 'Mpho Sithole', 
    patientId: 'p2',
    doctorName: 'Dr. Kagiso Dube', 
    diagnosis: 'Type 2 Diabetes Management',
    items: [
      { medicationId: '2', name: 'Metformin 500mg', quantity: 60, unit: 'tablets', instructions: '2x/day with meals' },
      { medicationId: '4', name: 'Amlodipine 5mg', quantity: 30, unit: 'tablets', instructions: '1x/day in the morning' }
    ],
    status: 'pending', 
    createdAt: new Date().toISOString() 
  },
];

const STATUS_COLORS: Record<RxStatus, string> = {
  pending: '#f59e0b',
  dispensed: '#10b981',
  rejected: '#ef4444',
};

const STATUS_ICONS: Record<RxStatus, string> = {
  pending: 'time-outline',
  dispensed: 'checkmark-circle-outline',
  rejected: 'close-circle-outline',
};

const DISPENSE_STEPS = [
  'Verify patient identity (name & ID)',
  'Cross-check prescription authenticity',
  'Confirm medication name & strength',
  'Verify dosage instructions',
  'Check for known drug interactions',
  'Label medication correctly',
  'Counsel patient on usage',
];

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [filter, setFilter] = useState<RxStatus | 'all'>('all');
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(DISPENSE_STEPS.length).fill(false));
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Subscribe to Firestore prescriptions; fall back to mock if empty
    const unsub = onSnapshot(collection(db, 'prescriptions'), (snap) => {
      if (!snap.empty) {
        const dataList = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            patientId: d.patientId,
            patientName: d.patientName || 'Unknown Patient',
            doctorName: d.doctorName || 'Unknown Doctor',
            diagnosis: d.diagnosis || d.patientDiagnosis || 'No Diagnosis',
            items: d.items || [],
            status: d.status,
            createdAt: d.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as Prescription;
        });
        setPrescriptions(dataList);
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = filter === 'all' ? prescriptions : prescriptions.filter(p => p.status === filter);

  const handleDispenseAction = async () => {
    if (!selected) return;
    
    const allChecked = checkedItems.every(Boolean);
    if (!allChecked) {
      Alert.alert('Incomplete Checklist', 'Please verify all clinical safety steps before dispensing.');
      return;
    }

    setProcessing(true);
    try {
      if (selected.id.startsWith('m')) {
        // Mock update for demo
        setPrescriptions(prev => prev.map(p => p.id === selected.id ? { ...p, status: 'dispensed' } : p));
      } else {
        await dispenseMedication(selected.id);
      }
      Alert.alert('Success', 'Medication dispensed and inventory updated.');
      setShowChecklist(false);
      setSelected(null);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Dispensing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const updateStatus = async (id: string, status: RxStatus) => {
    if (status === 'dispensed') {
      setCheckedItems(new Array(DISPENSE_STEPS.length).fill(false));
      setShowChecklist(true);
      return;
    }

    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    try {
      if (!id.startsWith('m')) {
        await updateDoc(doc(db, 'prescriptions', id), { status });
      }
      Alert.alert('Updated', `Prescription marked as ${status}.`);
    } catch (_) {}
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
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientName}>{item.patientName}</Text>
                  <Text style={styles.doctorName}>{item.doctorName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '15' }]}>
                  <Ionicons name={STATUS_ICONS[item.status] as any} size={14} color={STATUS_COLORS[item.status]} />
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.diagnosisRow}>
                <Ionicons name="medical-outline" size={14} color="#64748b" />
                <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
              </View>

              <View style={styles.medsContainer}>
                {item.items?.map((rx, idx) => (
                  <View key={idx} style={styles.medRow}>
                    <Ionicons name="medical" size={16} color={TEAL} />
                    <Text style={styles.medText}>{rx.name}</Text>
                    <Text style={styles.qtyLabel}>QTY: {rx.quantity}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="clipboard-outline" size={64} color="#cbd5e1" />
              <Text style={{ marginTop: 16, color: '#64748b', fontSize: 16, fontWeight: '600' }}>No prescriptions found</Text>
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
                <Ionicons name="close" size={24} color="#334155" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Order Details</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 14 }}>
              {[
                { label: 'Patient UID', value: selected.patientId, icon: 'person-outline' },
                { label: 'Diagnosis', value: selected.diagnosis, icon: 'pulse-outline' },
                { label: 'Prescribed By', value: selected.doctorName, icon: 'medkit-outline' },
              ].map(row => (
                <View key={row.label} style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name={row.icon as any} size={18} color={TEAL} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={styles.detailValue}>{row.value}</Text>
                  </View>
                </View>
              ))}

              <Text style={styles.innerSectionTitle}>Medications Ordered</Text>
              {selected.items.map((rx, idx) => (
                <View key={idx} style={styles.orderItemCard}>
                  <View style={styles.orderItemHeader}>
                    <Ionicons name="medical" size={20} color={TEAL} />
                    <Text style={styles.orderItemName}>{rx.name}</Text>
                  </View>
                  <View style={styles.orderItemBody}>
                    <Text style={styles.orderItemSub}>Dosage: {rx.instructions}</Text>
                    <Text style={styles.orderItemQty}>Quantity: {rx.quantity} {rx.unit}</Text>
                  </View>
                </View>
              ))}

              {selected.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                    onPress={() => updateStatus(selected.id, 'dispensed')}
                  >
                    <Ionicons name="medical-outline" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Dispense Box</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                    onPress={() => updateStatus(selected.id, 'rejected')}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Reject Order</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Checklist Modal */}
      <Modal visible={showChecklist} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.checklistCard}>
            <View style={styles.checklistHeader}>
              <View>
                <Text style={styles.checkTitle}>Verification Checklist</Text>
                <Text style={styles.checkSub}>Complete all steps to dispense</Text>
              </View>
              <TouchableOpacity onPress={() => setShowChecklist(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {DISPENSE_STEPS.map((step, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.checkRow}
                  onPress={() => {
                    const next = [...checkedItems];
                    next[i] = !next[i];
                    setCheckedItems(next);
                  }}
                >
                  <View style={[styles.checkBox, checkedItems[i] && styles.checkBoxActive]}>
                    {checkedItems[i] && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={[styles.checkText, checkedItems[i] && styles.checkTextDone]}>{step}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.finalDispenseBtn, !checkedItems.every(Boolean) && styles.btnDisabled]}
              onPress={handleDispenseAction}
              disabled={processing}
            >
              {processing ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  <Text style={styles.finalBtnText}>Confirm Clinical Dispension</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  patientName: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
  doctorName: { fontSize: 13, color: '#64748b', marginTop: 2, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  diagnosisRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  diagnosisText: { fontSize: 13, color: '#64748b', fontWeight: '500', fontStyle: 'italic' },
  medsContainer: { marginTop: 10, gap: 6 },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  medText: { fontSize: 14, fontWeight: '700', color: '#334155', flex: 1 },
  qtyLabel: { fontSize: 12, fontWeight: '800', color: TEAL, backgroundColor: '#f0f9ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  dosageText: { fontSize: 13, color: '#64748b' },
  innerSectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 10, marginBottom: 4 },
  orderItemCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  orderItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  orderItemName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  orderItemBody: { paddingLeft: 30, gap: 4 },
  orderItemSub: { fontSize: 14, color: '#475569', fontWeight: '500' },
  orderItemQty: { fontSize: 13, color: TEAL, fontWeight: '700' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  detailRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 18, gap: 14, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  detailIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center' },
  detailLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  detailValue: { fontSize: 15, color: '#1e293b', lineHeight: 22, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  checklistCard: { backgroundColor: '#fff', borderRadius: 28, padding: 24, width: '100%', maxWidth: 400, gap: 20 },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  checkTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  checkSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  checkBox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  checkBoxActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  checkText: { flex: 1, fontSize: 14, color: '#334155', fontWeight: '500' },
  checkTextDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  finalDispenseBtn: { backgroundColor: '#10b981', borderRadius: 18, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10 },
  btnDisabled: { backgroundColor: '#cbd5e1' },
  finalBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
