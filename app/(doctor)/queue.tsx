import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// Mock patient queue
const MOCK_QUEUE = [
  { id: '1', name: 'John Doe', time: '10:00 AM', status: 'waiting', priority: 'high', condition: 'Chest Pain (AI Flagged)' },
  { id: '2', name: 'Jane Smith', time: '10:15 AM', status: 'in-progress', priority: 'normal', condition: 'Routine Checkup' },
  { id: '3', name: 'Mike Johnson', time: '10:30 AM', status: 'waiting', priority: 'normal', condition: 'Fever & Cough' },
  { id: '4', name: 'Sarah Williams', time: '10:45 AM', status: 'waiting', priority: 'normal', condition: 'Prescription Refill' },
];

export default function PatientQueue() {
  const [queue, setQueue] = useState(MOCK_QUEUE);

  const renderPatient = ({ item }: any) => (
    <View style={[styles.card, item.priority === 'high' && styles.cardHighPriority]}>
      <View style={styles.cardHeader}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.timeTag}>{item.time}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.conditionRow}>
          <FontAwesome5 
            name={item.priority === 'high' ? 'exclamation-circle' : 'stethoscope'} 
            size={14} 
            color={item.priority === 'high' ? '#ef4444' : '#64748b'} 
          />
          <Text style={[styles.conditionText, item.priority === 'high' && { color: '#ef4444', fontWeight: 'bold' }]}>
            {item.condition}
          </Text>
        </View>
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Records</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
          <Text style={styles.primaryButtonText}>Call In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Queue</Text>
        <Text style={styles.subtitle}>{queue.filter(q => q.status === 'waiting').length} patients waiting</Text>
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.secondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccfbf1',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHighPriority: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  timeTag: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conditionText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#475569',
  },
  statusBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.light.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: Colors.light.secondary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
