import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, ScrollView, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { getPatientMedicalRecords } from '../../services/appointmentService';
import { getPatientInsights } from '../../services/patientService';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function MedicalRecords() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recordsData, insightsData] = await Promise.all([
          getPatientMedicalRecords(user.uid),
          getPatientInsights(user.uid)
        ]);
        setRecords(recordsData);
        setInsights(insightsData);
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Passport</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="share-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {insights && (
        <View style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="robot" size={14} color="#fff" />
              <Text style={styles.aiBadgeText}>AI INSIGHTS</Text>
            </View>
            <Text style={styles.insightsDate}>
              Last updated: {insights.updatedAt?.toDate().toLocaleDateString() || 'Today'}
            </Text>
          </View>
          <Text style={styles.summaryTitle}>Health Summary</Text>
          <Text style={styles.summaryText} numberOfLines={4}>
            {insights.summary}
          </Text>
          <TouchableOpacity style={styles.viewTimelineBtn} onPress={() => router.push('/(patient)/profile' as any)}>
            <Text style={styles.viewTimelineText}>View Detailed Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabContainer}>
        <View style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>Timeline</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Prescriptions</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Reports</Text>
        </View>
      </View>
    </View>
  );

  const RecordItem = ({ record }: { record: any }) => {
    const date = record.createdAt ? record.createdAt.toDate().toLocaleDateString() : 'Recent';
    const isPrescription = record.type === 'prescription';
    
    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLineContainer}>
          <View style={[styles.timelineDot, { backgroundColor: isPrescription ? '#f59e0b' : Colors.light.primary }]} />
          <View style={styles.timelineLine} />
        </View>
        
        <TouchableOpacity style={styles.recordCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeIcon, { backgroundColor: (isPrescription ? '#f59e0b' : Colors.light.primary) + '15' }]}>
              <FontAwesome5 
                name={isPrescription ? "pills" : "file-medical-alt"} 
                size={16} 
                color={isPrescription ? '#f59e0b' : Colors.light.primary} 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordType}>{record.type.toUpperCase()}</Text>
              <Text style={styles.recordDate}>{date}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.diagnosisText}>{record.diagnosis}</Text>
            <Text style={styles.doctorName}>with Dr. {record.doctorName}</Text>

            {isPrescription && record.details?.medications && (
              <View style={styles.medicationChipContainer}>
                {record.details.medications.slice(0, 2).map((med: any, i: number) => (
                  <View key={i} style={styles.medChip}>
                    <Text style={styles.medChipText} numberOfLines={1}>
                      {typeof med === 'object' ? med.name : med}
                    </Text>
                  </View>
                ))}
                {record.details.medications.length > 2 && (
                  <Text style={styles.moreMeds}>+{record.details.medications.length - 2} more</Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
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
      <FlatList
        data={records}
        keyExtractor={item => item.id}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <RecordItem record={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No medical records found yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerContainer: { padding: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  iconBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  insightsCard: { backgroundColor: '#0f172a', borderRadius: 24, padding: 20, marginBottom: 24 },
  insightsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aiBadge: { backgroundColor: Colors.light.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  aiBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  insightsDate: { color: '#64748b', fontSize: 11 },
  summaryTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  summaryText: { color: '#94a3b8', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  viewTimelineBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewTimelineText: { color: Colors.light.primary, fontWeight: '600', fontSize: 14 },
  tabContainer: { flexDirection: 'row', gap: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9' },
  activeTab: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#fff' },
  listContent: { paddingBottom: 40 },
  timelineItem: { flexDirection: 'row', paddingHorizontal: 20 },
  timelineLineContainer: { width: 24, alignItems: 'center' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#e2e8f0' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 24, zIndex: 1, borderWidth: 2, borderColor: '#fff' },
  recordCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, marginLeft: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  typeIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  recordType: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 },
  recordDate: { fontSize: 12, color: '#64748b' },
  cardBody: { paddingLeft: 46 },
  diagnosisText: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  doctorName: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  medicationChipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  medChip: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  medChipText: { fontSize: 12, color: '#166534', fontWeight: '600' },
  moreMeds: { fontSize: 12, color: '#64748b', alignSelf: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { color: '#94a3b8', fontSize: 16 },
});
