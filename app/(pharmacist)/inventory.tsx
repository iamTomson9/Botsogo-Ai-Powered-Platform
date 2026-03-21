import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const TEAL = '#0E7490';

interface DrugItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
}

const INITIAL_INVENTORY: DrugItem[] = [
  { id: '1', name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 240, minStock: 50, unit: 'capsules' },
  { id: '2', name: 'Metformin 500mg', category: 'Anti-diabetic', stock: 120, minStock: 60, unit: 'tablets' },
  { id: '3', name: 'Amlodipine 5mg', category: 'Antihypertensive', stock: 30, minStock: 40, unit: 'tablets' },
  { id: '4', name: 'Omeprazole 20mg', category: 'PPI', stock: 15, minStock: 30, unit: 'capsules' },
  { id: '5', name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, minStock: 100, unit: 'tablets' },
  { id: '6', name: 'Ibuprofen 400mg', category: 'NSAID', stock: 80, minStock: 50, unit: 'tablets' },
  { id: '7', name: 'Salbutamol Inhaler', category: 'Bronchodilator', stock: 8, minStock: 10, unit: 'inhalers' },
  { id: '8', name: 'Ciprofloxacin 500mg', category: 'Antibiotic', stock: 60, minStock: 30, unit: 'tablets' },
  { id: '9', name: 'Atorvastatin 10mg', category: 'Statin', stock: 90, minStock: 40, unit: 'tablets' },
  { id: '10', name: 'Losartan 50mg', category: 'ARB', stock: 45, minStock: 30, unit: 'tablets' },
  { id: '11', name: 'Doxycycline 100mg', category: 'Antibiotic', stock: 0, minStock: 20, unit: 'capsules' },
  { id: '12', name: 'Fluconazole 150mg', category: 'Antifungal', stock: 25, minStock: 15, unit: 'tablets' },
];

function getStockStatus(stock: number, min: number): { color: string; label: string } {
  if (stock === 0) return { color: '#ef4444', label: 'OUT OF STOCK' };
  if (stock < min) return { color: '#f59e0b', label: 'LOW STOCK' };
  return { color: '#10b981', label: 'IN STOCK' };
}

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<DrugItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');

  const filtered = inventory.filter(
    d => d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase())
  );

  const adjust = (id: string, delta: number) => {
    setInventory(prev =>
      prev.map(d => d.id === id ? { ...d, stock: Math.max(0, d.stock + delta) } : d)
    );
  };

  const lowCount = inventory.filter(d => d.stock < d.minStock).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Drug Inventory</Text>
          <Text style={styles.subtitle}>{inventory.length} drugs · {lowCount} low stock alerts</Text>
        </View>
        {lowCount > 0 && (
          <View style={styles.alertBadge}>
            <FontAwesome5 name="exclamation-triangle" size={14} color="#92400e" />
            <Text style={styles.alertBadgeText}>{lowCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.searchRow}>
        <FontAwesome5 name="search" size={14} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drug or category..."
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
                  <View style={[styles.stockTag, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.stockTagText, { color }]}>{label}</Text>
                  </View>
                </View>
                <Text style={styles.categoryText}>{item.category}</Text>
                <View style={styles.stockRow}>
                  <Text style={[styles.stockCount, { color }]}>{item.stock}</Text>
                  <Text style={styles.stockUnit}> {item.unit}</Text>
                  <Text style={styles.minText}>  (min: {item.minStock})</Text>
                </View>
              </View>

              {/* Adjust Buttons */}
              <View style={styles.adjustRow}>
                <TouchableOpacity style={styles.adjBtn} onPress={() => adjust(item.id, -1)}>
                  <FontAwesome5 name="minus" size={12} color={TEAL} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.adjBtn, styles.adjBtnPlus]} onPress={() => adjust(item.id, 10)}>
                  <FontAwesome5 name="plus" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <FontAwesome5 name="boxes" size={48} color="#cbd5e1" />
            <Text style={{ marginTop: 16, color: '#64748b', fontSize: 16 }}>No items found</Text>
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
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  drugName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', flex: 1, paddingRight: 8 },
  categoryText: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  stockRow: { flexDirection: 'row', alignItems: 'baseline' },
  stockCount: { fontSize: 22, fontWeight: 'bold' },
  stockUnit: { fontSize: 13, color: '#64748b' },
  minText: { fontSize: 12, color: '#94a3b8' },
  stockTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  stockTagText: { fontSize: 10, fontWeight: '800' },
  adjustRow: { gap: 8 },
  adjBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1.5, borderColor: TEAL,
    justifyContent: 'center', alignItems: 'center',
  },
  adjBtnPlus: { backgroundColor: TEAL, borderColor: TEAL },
});
