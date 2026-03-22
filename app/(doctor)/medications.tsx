import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

// We'll use a local mock or fetch from a service later
const MOCK_MEDS = [
  { id: '1', name: 'Amoxicillin', type: 'Antibiotic', stock: 450, unit: 'capsules', price: 'P45.00' },
  { id: '2', name: 'Paracetamol', type: 'Analgesic', stock: 1200, unit: 'tablets', price: 'P12.50' },
  { id: '3', name: 'Metformin', type: 'Antidiabetic', stock: 85, unit: 'packs', price: 'P110.00' },
  { id: '4', name: 'Lisinopril', type: 'Antihypertensive', stock: 15, unit: 'packs', price: 'P95.00' },
  { id: '5', name: 'Salbutamol', type: 'Bronchodilator', stock: 42, unit: 'inhalers', price: 'P65.00' },
];

export default function DoctorMedicationsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [meds, setMeds] = useState(MOCK_MEDS);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredMeds = meds.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.type.toLowerCase().includes(search.toLowerCase())
  );

  const MedCard = ({ item }: { item: typeof MOCK_MEDS[0] }) => (
    <View style={styles.medCard}>
      <View style={styles.medInfo}>
        <View style={styles.iconHole}>
          <MaterialCommunityIcons name="pill" size={24} color={Colors.light.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medType}>{item.type}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, item.stock > 0 ? styles.available : styles.unavailable]}>
            {item.stock > 0 ? 'AVAILABLE' : 'OUT OF STOCK'}
          </Text>
        </View>
      </View>
      <View style={styles.infoFooter}>
        <Ionicons name="information-circle-outline" size={14} color="#94a3b8" />
        <Text style={styles.footerText}>Contact pharmacy for exact stock or alternative formulations.</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Medications</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drug name or therapeutic class..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.secondary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredMeds}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <MedCard item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="magnify-close" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No medications found matching your search.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, paddingHorizontal: 16, height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  medCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  medInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  iconHole: { width: 50, height: 50, borderRadius: 16, backgroundColor: Colors.light.secondary + '10', justifyContent: 'center', alignItems: 'center' },
  medName: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  medType: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  statusText: { fontSize: 11, fontWeight: '800' },
  available: { color: '#10b981' },
  unavailable: { color: '#ef4444' },
  infoFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  footerText: { fontSize: 12, color: '#94a3b8', flex: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 16, fontSize: 15, lineHeight: 22 },
});
