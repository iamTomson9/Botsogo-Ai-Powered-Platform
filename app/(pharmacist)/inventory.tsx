import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { seedInventory, Medication } from '../../services/inventoryService';

const TEAL = '#0E7490';

const INITIAL_SEED_DATA = [
  { name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 240, minStock: 50, unit: 'capsules' },
  { name: 'Metformin 500mg', category: 'Anti-diabetic', stock: 120, minStock: 60, unit: 'tablets' },
  { name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 30, minStock: 40, unit: 'tablets' },
  { name: 'Omeprazole 20mg', category: 'PPI', stock: 15, minStock: 30, unit: 'capsules' },
  { name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, minStock: 100, unit: 'tablets' },
  { name: 'Ibuprofen 400mg', category: 'NSAID', stock: 80, minStock: 50, unit: 'tablets' },
  { name: 'Salbutamol Inhaler', category: 'Bronchodilator', stock: 8, minStock: 10, unit: 'inhalers' },
  { name: 'Ciprofloxacin 500mg', category: 'Antibiotic', stock: 60, minStock: 30, unit: 'tablets' },
  { name: 'Atorvastatin 10mg', category: 'Statin', stock: 90, minStock: 40, unit: 'tablets' },
  { name: 'Losartan 50mg', category: 'ARB', stock: 45, minStock: 30, unit: 'tablets' },
  { name: 'Doxycycline 100mg', category: 'Antibiotic', stock: 0, minStock: 20, unit: 'capsules' },
  { name: 'Fluconazole 150mg', category: 'Antifungal', stock: 25, minStock: 15, unit: 'tablets' },
];

function getStockStatus(stock: number, min: number): { color: string; label: string } {
  if (stock <= 0) return { color: '#ef4444', label: 'OUT OF STOCK' };
  if (stock < min) return { color: '#f59e0b', label: 'LOW STOCK' };
  return { color: '#10b981', label: 'IN STOCK' };
}

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'medications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Medication));
      setInventory(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSeed = async () => {
    await seedInventory(INITIAL_SEED_DATA);
  };

  const filtered = inventory.filter(
    d => d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
  );

  const adjust = async (id: string, delta: number) => {
    const ref = doc(db, 'medications', id);
    await updateDoc(ref, {
      stock: increment(delta)
    });
  };

  const lowCount = inventory.filter(d => d.stock < d.minStock).length;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Clinical Inventory</Text>
          <Text style={styles.subtitle}>{inventory.length} active medications · {lowCount} alerts</Text>
        </View>
        <TouchableOpacity onPress={handleSeed} style={styles.seedBtn}>
          <Ionicons name="cloud-download-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clinical stock..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => {
          const { color, label } = getStockStatus(item.stock, item.minStock);
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTop}>
                  <Text style={styles.drugName}>{item.name}</Text>
                  <View style={[styles.stockTag, { backgroundColor: color + '15' }]}>
                    <Text style={[styles.stockTagText, { color }]}>{label}</Text>
                  </View>
                </View>
                <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                <View style={styles.stockRow}>
                  <Text style={[styles.stockCount, { color }]}>{item.stock}</Text>
                  <Text style={styles.stockUnit}> {item.unit}</Text>
                  <View style={styles.minBadge}>
                    <Text style={styles.minText}>MIN: {item.minStock}</Text>
                  </View>
                </View>
              </View>

              {/* Adjust Buttons */}
              <View style={styles.adjustRow}>
                <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(item.id, -1)}>
                  <Ionicons name="remove" size={18} color={TEAL} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.adjBtn, styles.adjBtnPlus]} onPress={() => adjust(item.id, 10)}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Ionicons name="cube-outline" size={64} color="#cbd5e1" />
            <Text style={{ marginTop: 16, color: '#64748b', fontSize: 16, fontWeight: '600' }}>No inventory items found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: {
    padding: 20, backgroundColor: TEAL,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: '#a5f3fc', marginTop: 4 },
  alertBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fef3c7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
  },
  alertBadgeText: { fontWeight: 'bold', color: '#92400e', fontSize: 14 },
  seedBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#0f172a', fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  drugName: { fontSize: 17, fontWeight: '800', color: '#0f172a', flex: 1, paddingRight: 8 },
  categoryText: { fontSize: 11, color: '#94a3b8', marginBottom: 10, fontWeight: '700', letterSpacing: 0.5 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockCount: { fontSize: 28, fontWeight: '800' },
  stockUnit: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  minBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
  minText: { fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  stockTag: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  stockTagText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.3 },
  adjustRow: { gap: 10 },
  adjBtn: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 2, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center',
  },
  adjBtnPlus: { backgroundColor: TEAL, borderColor: TEAL },
});
