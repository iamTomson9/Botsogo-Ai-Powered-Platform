import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const TEAL = '#0E7490';

const DISPENSE_STEPS = [
  'Verify patient identity (name & ID)',
  'Cross-check prescription authenticity',
  'Confirm medication name & strength',
  'Verify dosage instructions',
  'Check for known drug interactions',
  'Check stock availability',
  'Label medication correctly',
  'Counsel patient on usage',
];

export default function DispenseScreen() {
  const [search, setSearch] = useState('');
  const [checklist, setChecklist] = useState<boolean[]>(new Array(DISPENSE_STEPS.length).fill(false));
  const [showConfirm, setShowConfirm] = useState(false);
  const [dispensed, setDispensed] = useState(false);

  const allChecked = checklist.every(Boolean);

  const toggleStep = (i: number) => {
    const updated = [...checklist];
    updated[i] = !updated[i];
    setChecklist(updated);
  };

  const handleDispense = () => {
    if (!search.trim()) {
      Alert.alert('Required', 'Please enter a patient name or prescription ID.');
      return;
    }
    if (!allChecked) {
      Alert.alert('Incomplete Checklist', 'Please complete all verification steps before dispensing.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmDispense = () => {
    setShowConfirm(false);
    setDispensed(true);
    setSearch('');
    setChecklist(new Array(DISPENSE_STEPS.length).fill(false));
  };

  const completedCount = checklist.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Dispense Medication</Text>
        <Text style={styles.subtitle}>Step-by-step dispensing workflow</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Success Banner */}
        {dispensed && (
          <View style={styles.successBanner}>
            <FontAwesome5 name="check-circle" size={22} color="#10b981" />
            <Text style={styles.successText}>Medication dispensed successfully!</Text>
            <TouchableOpacity onPress={() => setDispensed(false)}>
              <FontAwesome5 name="times" size={16} color="#10b981" />
            </TouchableOpacity>
          </View>
        )}

        {/* Patient Lookup */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Patient / Prescription ID</Text>
          <View style={styles.inputRow}>
            <FontAwesome5 name="search" size={14} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Enter patient name or Rx ID..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.section}>
          <View style={styles.checklistHeader}>
            <Text style={styles.sectionLabel}>Dispensing Checklist</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{completedCount}/{DISPENSE_STEPS.length}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / DISPENSE_STEPS.length) * 100}%` }]} />
          </View>

          {DISPENSE_STEPS.map((step, i) => (
            <TouchableOpacity key={i} style={styles.checkRow} onPress={() => toggleStep(i)}>
              <View style={[styles.checkBox, checklist[i] && styles.checkBoxDone]}>
                {checklist[i] && <FontAwesome5 name="check" size={12} color="#fff" />}
              </View>
              <Text style={[styles.checkText, checklist[i] && styles.checkTextDone]}>
                {step}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dispense Button */}
        <TouchableOpacity
          style={[styles.dispenseBtn, (!allChecked || !search.trim()) && styles.dispenseBtnDisabled]}
          onPress={handleDispense}
        >
          <FontAwesome5 name="capsules" size={18} color="#fff" />
          <Text style={styles.dispenseBtnText}>Confirm & Dispense</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <FontAwesome5 name="capsules" size={32} color={TEAL} />
            </View>
            <Text style={styles.confirmTitle}>Ready to Dispense?</Text>
            <Text style={styles.confirmSub}>
              You've completed all {DISPENSE_STEPS.length} verification steps for{'\n'}
              <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{search}</Text>.
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.goBtn} onPress={confirmDispense}>
                <Text style={styles.goBtnText}>Dispense Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: { padding: 20, backgroundColor: TEAL, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#a5f3fc', marginTop: 4 },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#d1fae5', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#6ee7b7',
  },
  successText: { flex: 1, color: '#065f46', fontWeight: '600', fontSize: 14 },
  section: { backgroundColor: '#fff', borderRadius: 18, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f8fafc', borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  input: { flex: 1, fontSize: 16, color: '#0f172a' },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressBadge: { backgroundColor: '#e0f2fe', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  progressText: { fontSize: 13, fontWeight: '700', color: TEAL },
  progressBar: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 4, marginBottom: 16 },
  progressFill: { height: 6, backgroundColor: TEAL, borderRadius: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  checkBox: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 2, borderColor: '#cbd5e1',
    justifyContent: 'center', alignItems: 'center',
  },
  checkBoxDone: { backgroundColor: TEAL, borderColor: TEAL },
  checkText: { flex: 1, fontSize: 14, color: '#334155' },
  checkTextDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  dispenseBtn: {
    backgroundColor: TEAL, borderRadius: 18, paddingVertical: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
    shadowColor: TEAL, shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  dispenseBtnDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0 },
  dispenseBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  confirmCard: { backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%' },
  confirmIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  confirmTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  confirmSub: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  confirmBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', color: '#475569' },
  goBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: TEAL, alignItems: 'center' },
  goBtnText: { fontWeight: '700', color: '#fff', fontSize: 15 },
});
