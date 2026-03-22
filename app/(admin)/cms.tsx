import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAllStockRequests, updateStockRequestStatus } from '../../services/stockService';
import { Colors } from '../../constants/Colors';

export default function CMSDashboardScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const list = await getAllStockRequests();
      setRequests(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (status: 'approved' | 'denied' | 'shipped') => {
    if (!selectedReq) return;
    setSubmitting(true);
    try {
      await updateStockRequestStatus(selectedReq.id, status, notes);
      Alert.alert("Success", `Request marked as ${status}`);
      setSelectedReq(null);
      setNotes('');
      loadRequests();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update request.");
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
        <Text style={styles.title}>CMS Management</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadRequests}>
          <FontAwesome5 name="sync" size={16} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{requests.filter(r => r.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{requests.filter(r => r.status === 'approved').length}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
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
            <TouchableOpacity 
              style={styles.requestCard}
              onPress={() => item.status === 'pending' && setSelectedReq(item)}
              disabled={item.status !== 'pending'}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.clinicName}>{item.clinicName}</Text>
                  <Text style={styles.medName}>{item.medicationName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.qtyText}>Qty Requested: <Text style={styles.bold}>{item.quantity}</Text></Text>
                <Text style={styles.dateText}>Requested: {item.createdAt?.toDate().toLocaleDateString()}</Text>
                {item.status === 'pending' && (
                  <View style={styles.actionPrompt}>
                    <Text style={styles.actionText}>Tap to Respond</Text>
                    <FontAwesome5 name="chevron-right" size={10} color={Colors.light.primary} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <FontAwesome5 name="box-open" size={40} color="#cbd5e1" />
              <Text style={styles.emptyText}>No requests to display.</Text>
            </View>
          }
        />
      )}

      {/* Response Modal */}
      <Modal visible={!!selectedReq} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Stock Request Approval</Text>
              <TouchableOpacity onPress={() => setSelectedReq(null)}>
                <FontAwesome5 name="times" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Clinic: <Text style={styles.summaryValue}>{selectedReq?.clinicName}</Text></Text>
                <Text style={styles.summaryLabel}>Medication: <Text style={styles.summaryValue}>{selectedReq?.medicationName}</Text></Text>
                <Text style={styles.summaryLabel}>Quantity: <Text style={styles.summaryValue}>{selectedReq?.quantity}</Text></Text>
              </View>

              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholder="Details about approval or reason for denial..."
                multiline
                numberOfLines={3}
              />

              <View style={styles.btnRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.denyBtn]} 
                  onPress={() => handleUpdate('denied')}
                  disabled={submitting}
                >
                  <Text style={styles.denyText}>Deny</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.approveBtn]} 
                  onPress={() => handleUpdate('approved')}
                  disabled={submitting}
                >
                  <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  refreshBtn: { padding: 8 },
  statsRow: { flexDirection: 'row', padding: 20, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#f59e0b', elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  requestCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  clinicName: { fontSize: 12, fontWeight: 'bold', color: Colors.light.primary, textTransform: 'uppercase' },
  medName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '900' },
  cardBody: { gap: 4 },
  qtyText: { fontSize: 14, color: '#475569' },
  bold: { fontWeight: 'bold', color: '#0f172a' },
  dateText: { fontSize: 12, color: '#94a3b8' },
  actionPrompt: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  actionText: { fontSize: 12, color: Colors.light.primary, fontWeight: 'bold' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: '#94a3b8', fontSize: 16 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  modalBody: { gap: 20 },
  summaryCard: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, gap: 8 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontWeight: 'bold', color: '#0f172a' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 16, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0', textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  denyBtn: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fee2e2' },
  approveBtn: { backgroundColor: Colors.light.primary },
  denyText: { color: '#ef4444', fontWeight: 'bold' },
  approveText: { color: '#fff', fontWeight: 'bold' },
});
