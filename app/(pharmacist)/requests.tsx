import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyClinicRequests, requestMedication } from '../../services/stockService';
import { getMedicationsList } from '../../services/inventoryService';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';

export default function StockRequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.assignedClinicId) return;
    setLoading(true);
    try {
      const [reqList, medList] = await Promise.all([
        getMyClinicRequests(user.assignedClinicId),
        getMedicationsList()
      ]);
      setRequests(reqList);
      setMeds(medList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!selectedMed || !quantity || isNaN(Number(quantity))) {
      Alert.alert("Error", "Please select a medication and enter a valid quantity.");
      return;
    }

    setSubmitting(true);
    try {
      await requestMedication({
        medicationId: selectedMed.id,
        medicationName: selectedMed.name,
        quantity: Number(quantity),
        clinicId: user?.assignedClinicId || '',
        clinicName: user?.assignedClinicId === 'c1' ? 'Gaborone Main Clinic' : 'Local Clinic', // Simplified for now
      });
      setShowModal(false);
      setSelectedMed(null);
      setQuantity('');
      loadData();
      Alert.alert("Success", "Stock request sent to CMS!");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to send request.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'denied': return '#ef4444';
      case 'shipped': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>CMS Logistics</Text>
          <Text style={styles.subtitle}>Medication replenishment requests</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Request Support</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.light.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.medName}>{item.medicationName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="layers-outline" size={14} color="#94a3b8" />
                  <Text style={styles.infoText}>Order Volume: {item.quantity}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.infoText}>
                    Logged: {item.createdAt?.toDate().toLocaleDateString()}
                  </Text>
                </View>
                {item.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>CMS Notes:</Text>
                    <Text style={styles.notesText}>{item.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="file-tray-full-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No logistics requests logged.</Text>
            </View>
          }
        />
      )}

      {/* New Request Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New CMS Requisition</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Select Medication</Text>
              <ScrollView style={styles.medList} nestedScrollEnabled>
                {meds.map(med => (
                  <TouchableOpacity 
                    key={med.id} 
                    style={[styles.medOption, selectedMed?.id === med.id && styles.medOptionActive]}
                    onPress={() => setSelectedMed(med)}
                  >
                    <Text style={[styles.medOptionText, selectedMed?.id === med.id && styles.medOptionTextActive]}>
                      {med.name}
                    </Text>
                    <Text style={styles.stockLevel}>Current: {med.stock} {med.unit}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Quantity to Request</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="e.g. 500"
              />

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
                onPress={handleRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#0f172a', shadowOpacity: 0.06, shadowRadius: 15, elevation: 5 },
  title: { fontSize: 22, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.secondary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, shadowColor: Colors.light.secondary, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4 },
  addBtnText: { color: '#fff', fontWeight: '800', marginLeft: 8, fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  requestCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#0f172a', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  medName: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardBody: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  notesBox: { marginTop: 12, padding: 14, backgroundColor: '#f1f5f9', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  notesLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' },
  notesText: { fontSize: 13, color: '#1e293b', lineHeight: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 120 },
  emptyText: { marginTop: 16, color: '#94a3b8', fontSize: 15, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 28, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  modalBody: { gap: 20 },
  label: { fontSize: 14, fontWeight: '800', color: '#475569', letterSpacing: 0.3 },
  input: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, fontSize: 16, color: '#0f172a', fontWeight: '600', borderWidth: 1.5, borderColor: '#e2e8f0' },
  medList: { maxHeight: 240, backgroundColor: '#fff', borderRadius: 20, padding: 10, borderWidth: 1.5, borderColor: '#f1f5f9' },
  medOption: { padding: 14, borderRadius: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  medOptionActive: { backgroundColor: Colors.light.secondary + '10', borderColor: Colors.light.secondary, borderWidth: 1.5 },
  medOptionText: { fontSize: 15, color: '#334155', fontWeight: '500' },
  medOptionTextActive: { fontWeight: '800', color: Colors.light.secondary },
  stockLevel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  submitBtn: { backgroundColor: Colors.light.secondary, padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 10, shadowColor: Colors.light.secondary, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
});
