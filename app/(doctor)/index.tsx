import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function DoctorDashboard() {
  const router = useRouter();

  const StatCard = ({ title, count, icon, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statCount}>{count}</Text>
      </View>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <FontAwesome5 name={icon} size={24} color={color} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Dr. Surname,</Text>
          <Text style={styles.dateText}>{new Date().toDateString()}</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard title="Patients Waiting" count="12" icon="users" color="#f59e0b" />
          <StatCard title="AI Flagged Urgent" count="3" icon="exclamation-triangle" color="#ef4444" />
          <StatCard title="Completed Today" count="18" icon="check-circle" color="#10b981" />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(doctor)/queue')}>
            <FontAwesome5 name="clipboard-list" size={24} color={Colors.light.secondary} />
            <Text style={styles.actionText}>View Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="notes-medical" size={24} color={Colors.light.secondary} />
            <Text style={styles.actionText}>Add Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="pills" size={24} color={Colors.light.secondary} />
            <Text style={styles.actionText}>Prescriptions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5 name="calendar-alt" size={24} color={Colors.light.secondary} />
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent AI Alerts</Text>
        {/* Mock alert mapping */}
        {[1, 2].map((i) => (
          <View key={i} style={styles.alertCard}>
            <FontAwesome5 name="robot" size={20} color="#64748b" />
            <View style={styles.alertContext}>
              <Text style={styles.alertTitle}>Patient #8274 flagged</Text>
              <Text style={styles.alertDesc}>High severity symptoms: Chest pain, shortness of breath reported 5 mins ago.</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 26, fontWeight: '700', color: '#0f172a' },
  dateText: { fontSize: 16, color: '#64748b', marginTop: 4 },
  statsContainer: { marginBottom: 32 },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statInfo: { flex: 1 },
  statTitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  statCount: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  statIconContainer: { padding: 12, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 16 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32, gap: 12 },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: { marginTop: 12, fontWeight: '600', color: '#334155' },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  alertContext: { marginLeft: 16, flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  alertDesc: { fontSize: 14, color: '#475569', lineHeight: 20 }
});
