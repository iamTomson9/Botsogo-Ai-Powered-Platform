import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { getPatientMedicalRecords } from '../../services/appointmentService';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

export default function MedicalRecords() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchRecords = async () => {
      setLoading(true);
      console.log(`Fetching records for patient: ${user.uid}`);
      try {
        const data = await getPatientMedicalRecords(user.uid);
        console.log(`Found ${data.length} records.`);
        setRecords(data);
      } catch (e) {
        console.error("Error fetching patient records:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user]);

  const RecordItem = ({ record }: { record: any }) => {
    const date = record.createdAt ? record.createdAt.toDate().toLocaleDateString() : 'Recent';
    
    return (
      <View style={styles.recordCard}>
        <View style={styles.cardHeader}>
          <View style={styles.typeIcon}>
            <FontAwesome5 
              name={record.type === 'prescription' ? "pills" : "file-medical-alt"} 
              size={18} 
              color={Colors.light.primary} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recordType}>{record.type.toUpperCase()}</Text>
            <Text style={styles.recordDate}>{date}</Text>
          </View>
          <Text style={styles.doctorName}>Dr. {record.doctorName}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.diagnosisLabel}>DIAGNOSIS</Text>
          <Text style={styles.diagnosisText}>{record.diagnosis}</Text>

          {record.details?.medications && (
            <View style={styles.medicationList}>
              <Text style={styles.medLabel}>PRESCRIBED:</Text>
              {record.details.medications.map((med: any, i: number) => {
                const isObject = typeof med === 'object';
                const name = isObject ? med.name : med;
                const dosage = isObject ? med.dosage : '';
                const instr = isObject ? med.instructions : '';

                return (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <View style={styles.medItem}>
                      <FontAwesome5 name="check" size={10} color="#10b981" />
                      <Text style={styles.medText}>{name} {dosage ? `(${dosage})` : ''}</Text>
                    </View>
                    {instr ? (
                      <Text style={styles.medInstruction}>" {instr} "</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          {record.type === 'consultation' && record.details?.summary && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.diagnosisLabel}>ASSESSMENT SUMMARY</Text>
              <Text style={{ fontSize: 14, color: '#475569', marginTop: 4, lineHeight: 20 }}>
                {record.details.summary}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Medical Records</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <RecordItem record={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="folder-open" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No medical records found yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    padding: 24, 
    backgroundColor: Colors.light.primary, 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  listContent: { padding: 20, gap: 16 },
  recordCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#e2e8f0'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  typeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.light.primary + '15', justifyContent: 'center', alignItems: 'center' },
  recordType: { fontSize: 11, fontWeight: '800', color: Colors.light.primary, letterSpacing: 1 },
  recordDate: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  doctorName: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  cardBody: { gap: 12 },
  diagnosisLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
  diagnosisText: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  medicationList: { backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, marginTop: 4 },
  medLabel: { fontSize: 10, fontWeight: '800', color: '#10b981', marginBottom: 8 },
  medItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  medText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  medInstruction: { fontSize: 12, color: '#64748b', marginLeft: 18, fontStyle: 'italic', marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { color: '#94a3b8', fontSize: 16 },
});
