import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
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
        <Text style={styles.title}>CMS Stock Requests</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <FontAwesome5 name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>New Request</Text>
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
                  <FontAwesome5 name="layer-group" size={12} color="#94a3b8" />
                  <Text style={styles.infoText}>Quantity Requested: {item.quantity}</Text>
                </View>
                <View style={styles.infoRow}>
                  <FontAwesome5 name="calendar-alt" size={12} color="#94a3b8" />
                  <Text style={styles.infoText}>
                    Date: {item.createdAt?.toDate().toLocaleDateString()}
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
              <FontAwesome5 name="clipboard-list" size={40} color="#cbd5e1" />
              <Text style={styles.emptyText}>No stock requests yet.</Text>
            </View>
          }
        />
      )}

      {/* New Request Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Stock from CMS</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <FontAwesome5 name="times" size={20} color="#64748b" />
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  requestCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  medName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '900' },
  cardBody: { gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#475569' },
  notesBox: { marginTop: 8, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8 },
  notesLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 2 },
  notesText: { fontSize: 13, color: '#334155' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: '#94a3b8', fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  modalBody: { gap: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 16, color: '#0f172a' },
  medList: { maxHeight: 200, backgroundColor: '#f8fafc', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  medOption: { padding: 12, borderRadius: 8, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medOptionActive: { backgroundColor: Colors.light.primary + '15', borderColor: Colors.light.primary, borderWidth: 1 },
  medOptionText: { fontSize: 14, color: '#334155' },
  medOptionTextActive: { fontWeight: 'bold', color: Colors.light.primary },
  stockLevel: { fontSize: 12, color: '#94a3b8' },
  submitBtn: { backgroundColor: Colors.light.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
