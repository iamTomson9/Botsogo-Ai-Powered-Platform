import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// Comprehensive medication reference database
const MEDICATIONS = [
  { id: '1', name: 'Amoxicillin', category: 'Antibiotic', dosage: '500mg 3x/day', duration: '7-10 days', indications: 'Bacterial infections, pneumonia, sinusitis, UTI', contraindications: 'Penicillin allergy', sideEffects: 'Nausea, diarrhea, rash', schedule: 'B' },
  { id: '2', name: 'Metformin', category: 'Anti-diabetic', dosage: '500-1000mg 2x/day', duration: 'Ongoing', indications: 'Type 2 Diabetes mellitus', contraindications: 'Renal impairment (eGFR < 30), liver disease', sideEffects: 'GI upset, lactic acidosis (rare)', schedule: 'B' },
  { id: '3', name: 'Amlodipine', category: 'Antihypertensive', dosage: '5-10mg 1x/day', duration: 'Ongoing', indications: 'Hypertension, angina', contraindications: 'Severe hypotension, aortic stenosis', sideEffects: 'Peripheral edema, headache, flushing', schedule: 'B' },
  { id: '4', name: 'Atenolol', category: 'Beta-blocker', dosage: '25-100mg 1x/day', duration: 'Ongoing', indications: 'Hypertension, angina, post-MI', contraindications: 'Asthma, bradycardia, heart block', sideEffects: 'Fatigue, bradycardia, cold extremities', schedule: 'B' },
  { id: '5', name: 'Ibuprofen', category: 'NSAID', dosage: '400-800mg 3x/day', duration: 'Short-term', indications: 'Pain, fever, inflammation', contraindications: 'Peptic ulcer, renal disease, 3rd trimester pregnancy', sideEffects: 'GI irritation, bleeding risk, renal impairment', schedule: 'OTC' },
  { id: '6', name: 'Paracetamol', category: 'Analgesic', dosage: '500-1000mg 4x/day (max 4g/day)', duration: 'As needed', indications: 'Pain, fever', contraindications: 'Hepatic impairment', sideEffects: 'Hepatotoxicity in overdose', schedule: 'OTC' },
  { id: '7', name: 'Salbutamol Inhaler', category: 'Bronchodilator', dosage: '1-2 puffs PRN (max 8 puffs/day)', duration: 'As needed', indications: 'Asthma, COPD, bronchospasm', contraindications: 'Hypersensitivity', sideEffects: 'Tremor, tachycardia, hypokalemia', schedule: 'B' },
  { id: '8', name: 'Omeprazole', category: 'PPI', dosage: '20-40mg 1x/day (before meals)', duration: '4-8 weeks', indications: 'GERD, peptic ulcer, H.pylori', contraindications: 'Hypersensitivity', sideEffects: 'Headache, nausea, vitamin B12 deficiency (long-term)', schedule: 'B' },
  { id: '9', name: 'Ciprofloxacin', category: 'Antibiotic', dosage: '250-750mg 2x/day', duration: '5-14 days', indications: 'UTI, respiratory tract infection, GI infections', contraindications: 'Children, pregnancy, tendon disorders', sideEffects: 'Tendinitis, photosensitivity, GI upset', schedule: 'B' },
  { id: '10', name: 'Atorvastatin', category: 'Statin', dosage: '10-80mg 1x/day (evening)', duration: 'Ongoing', indications: 'Hypercholesterolaemia, cardiovascular risk reduction', contraindications: 'Active liver disease, pregnancy', sideEffects: 'Myopathy, elevated liver enzymes', schedule: 'B' },
  { id: '11', name: 'Losartan', category: 'ARB/Antihypertensive', dosage: '25-100mg 1x/day', duration: 'Ongoing', indications: 'Hypertension, diabetic nephropathy, heart failure', contraindications: 'Pregnancy, bilateral renal artery stenosis', sideEffects: 'Dizziness, hyperkalemia, elevated creatinine', schedule: 'B' },
  { id: '12', name: 'Insulin Glargine', category: 'Insulin', dosage: 'Individual dosing (Units SC once daily)', duration: 'Ongoing', indications: 'Type 1 and Type 2 DM requiring basal insulin', contraindications: 'Hypoglycemia episode', sideEffects: 'Hypoglycemia, injection site reactions', schedule: 'B' },
  { id: '13', name: 'Doxycycline', category: 'Antibiotic', dosage: '100mg 2x/day', duration: '7-21 days', indications: 'Chlamydia, malaria prophylaxis, tick-borne illness', contraindications: 'Children under 8, pregnancy, breastfeeding', sideEffects: 'Photosensitivity, esophagitis, GI upset', schedule: 'B' },
  { id: '14', name: 'Fluconazole', category: 'Antifungal', dosage: '150mg single dose (or 200mg/day)', duration: '1-14 days', indications: 'Candidiasis, cryptococcal meningitis', contraindications: 'QT prolongation, terfenadine use', sideEffects: 'Nausea, headache, liver toxicity (prolonged use)', schedule: 'B' },
];

const CATEGORIES = ['All', ...Array.from(new Set(MEDICATIONS.map(m => m.category)))];

const SCHEDULE_COLORS: Record<string, string> = {
  'OTC': '#10b981',
  'B': Colors.light.secondary,
  'C': '#f59e0b',
};

export default function Medications() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMed, setSelectedMed] = useState<typeof MEDICATIONS[0] | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MEDICATIONS.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(q) || m.indications.toLowerCase().includes(q);
      const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Medications</Text>
        <Text style={styles.subtitle}>Clinical reference & formulary</Text>
      </View>

      <View style={styles.searchRow}>
        <FontAwesome5 name="search" size={14} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drug name or indication..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.medCard} onPress={() => setSelectedMed(item)}>
            <View style={styles.medCardLeft}>
              <Text style={styles.medName}>{item.name}</Text>
              <Text style={styles.medCategory}>{item.category}</Text>
              <Text style={styles.medDosage}>{item.dosage}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <View style={[styles.scheduleTag, { backgroundColor: (SCHEDULE_COLORS[item.schedule] ?? '#64748b') + '20' }]}>
                <Text style={[styles.scheduleText, { color: SCHEDULE_COLORS[item.schedule] ?? '#64748b' }]}>
                  Schedule {item.schedule}
                </Text>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color="#cbd5e1" />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Medication Detail Modal */}
      <Modal visible={!!selectedMed} animationType="slide" presentationStyle="pageSheet">
        {selectedMed && (
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedMed(null)}>
                <FontAwesome5 name="times" size={22} color="#334155" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.modalTitle}>{selectedMed.name}</Text>
                <Text style={{ color: Colors.light.secondary, fontWeight: '600', fontSize: 13 }}>{selectedMed.category}</Text>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
              {[
                { label: 'Dosage & Frequency', value: selectedMed.dosage, icon: 'pills' },
                { label: 'Treatment Duration', value: selectedMed.duration, icon: 'clock' },
                { label: 'Indications', value: selectedMed.indications, icon: 'stethoscope' },
                { label: 'Contraindications', value: selectedMed.contraindications, icon: 'ban' },
                { label: 'Side Effects', value: selectedMed.sideEffects, icon: 'exclamation-triangle' },
              ].map(row => (
                <View key={row.label} style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <FontAwesome5 name={row.icon} size={16} color={Colors.light.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={styles.detailValue}>{row.value}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: Colors.light.secondary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#ccfbf1', marginTop: 4 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a' },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0' },
  categoryChipActive: { backgroundColor: Colors.light.secondary },
  categoryText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  medCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  medCardLeft: { flex: 1 },
  medName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  medCategory: { fontSize: 13, color: Colors.light.secondary, marginTop: 2, fontWeight: '600' },
  medDosage: { fontSize: 13, color: '#64748b', marginTop: 4 },
  scheduleTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  scheduleText: { fontSize: 11, fontWeight: '800' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  detailRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 14, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  detailIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.light.secondary + '15', justifyContent: 'center', alignItems: 'center' },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 15, color: '#334155', lineHeight: 22 },
});
