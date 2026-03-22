import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import clinicsData from '../../clinics.json';
import { bookAppointment } from '../../services/appointmentService';

const ACTIVE_CLINICS = (clinicsData as any[]).filter(c => c.status?.toLowerCase() === 'active' || !c.status);

const REASON_PRESETS = [
  'General Check-up',
  'Fever & Flu',
  'Chest Pain',
  'Injury / Wound',
  'Mental Health',
  'Chronic Medication',
  'Other',
];

export default function BookAppointment() {
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [booking, setBooking] = useState(false);
  const [showClinicPicker, setShowClinicPicker] = useState(false);

  const filteredClinics = useMemo(() => {
    const q = search.toLowerCase();
    return ACTIVE_CLINICS.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q) ||
      (c.town || '').toLowerCase().includes(q)
    ).slice(0, 30);
  }, [search]);

  const finalReason = reason === 'Other' ? customReason.trim() : reason;

  const handleBook = async () => {
    if (!selectedClinic) { Alert.alert('Please select a hospital or clinic first.'); return; }
    if (!finalReason) { Alert.alert('Please select or enter the reason for your visit.'); return; }
    if (!user) { Alert.alert('You must be logged in to book.'); return; }

    setBooking(true);
    try {
      await bookAppointment(
        user.uid,
        user.displayName || user.email || 'Patient',
        selectedClinic.id || selectedClinic.name,
        selectedClinic.name,
        finalReason
      );
      Alert.alert(
        'Appointment Confirmed',
        `You have been added to the queue at ${selectedClinic.name}.\n\nGo to "My Queue" to track your position.`,
        [{ text: 'View My Queue', onPress: () => router.replace('/(patient)/my-queue') }]
      );
    } catch (e) {
      Alert.alert('Error', 'Could not book appointment. Please try again.');
      console.error(e);
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Clinic Selection */}
          <Text style={styles.label}>Select Hospital / Clinic</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowClinicPicker(true)}>
            <FontAwesome5 name="hospital" size={16} color={Colors.light.primary} />
            <Text style={[styles.selectText, !selectedClinic && { color: '#94a3b8' }]}>
              {selectedClinic ? selectedClinic.name : 'Tap to choose a clinic...'}
            </Text>
            <FontAwesome5 name="chevron-down" size={14} color="#94a3b8" />
          </TouchableOpacity>
          {selectedClinic && (
            <View style={styles.clinicDetail}>
              <FontAwesome5 name="map-marker-alt" size={12} color={Colors.light.primary} />
              <Text style={styles.clinicDetailText}>
                {[selectedClinic.town, selectedClinic.district].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          {/* Reason */}
          <Text style={[styles.label, { marginTop: 24 }]}>Reason for Visit</Text>
          <View style={styles.reasonGrid}>
            {REASON_PRESETS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.reasonChip, reason === r && styles.reasonChipActive]}
                onPress={() => setReason(r)}
              >
                <Text style={[styles.reasonChipText, reason === r && styles.reasonChipTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {reason === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Describe your symptoms..."
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              numberOfLines={3}
            />
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.bookBtn, (!selectedClinic || !finalReason) && { opacity: 0.5 }]}
            onPress={handleBook}
            disabled={booking || !selectedClinic || !finalReason}
          >
            {booking
              ? <ActivityIndicator color="#fff" />
              : <>
                  <FontAwesome5 name="calendar-check" size={18} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.bookBtnText}>Confirm Booking</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Clinic Picker Modal */}
      <Modal visible={showClinicPicker} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choose a Clinic</Text>
            <TouchableOpacity onPress={() => setShowClinicPicker(false)}>
              <FontAwesome5 name="times" size={22} color="#334155" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBox}>
            <FontAwesome5 name="search" size={14} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, fontSize: 16 }}
              placeholder="Search by name, town, district..."
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredClinics}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.clinicRow}
                onPress={() => { setSelectedClinic(item); setShowClinicPicker(false); }}
              >
                <View style={styles.clinicRowIcon}>
                  <FontAwesome5 name="hospital" size={18} color={Colors.light.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clinicRowName}>{item.name}</Text>
                  <Text style={styles.clinicRowSub}>{[item.town, item.district].filter(Boolean).join(' • ')}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>No clinics found.</Text>}
          />
        </SafeAreaView>
      </Modal>
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
  content: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  selectBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: '#e2e8f0',
    gap: 10,
  },
  selectText: { flex: 1, fontSize: 16, color: '#0f172a' },
  clinicDetail: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingLeft: 4 },
  clinicDetailText: { fontSize: 13, color: Colors.light.primary },
  reasonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reasonChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#e2e8f0',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  reasonChipActive: { backgroundColor: '#e0f2fe', borderColor: Colors.light.primary },
  reasonChipText: { fontSize: 13, color: '#334155' },
  reasonChipTextActive: { color: Colors.light.primary, fontWeight: '700' },
  input: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, minHeight: 80,
    fontSize: 15, borderWidth: 1.5, borderColor: '#e2e8f0', marginTop: 12,
    textAlignVertical: 'top',
  },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.light.primary, borderRadius: 16,
    paddingVertical: 18, marginTop: 32,
    shadowColor: Colors.light.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  bookBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  pickerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', margin: 16,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  clinicRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  clinicRowIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  clinicRowName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  clinicRowSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
});
