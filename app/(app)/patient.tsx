import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import BookAppointment from '../../components/Patient/BookAppointment';
import SymptomChecker from '../../components/Patient/SymptomChecker';
import MyClinics from '../../components/Patient/MyClinics';
import { LogOut } from 'lucide-react-native';

const MOCK_CLINICS = [
  { id: 'c1', name: 'Gaborone Main Clinic', latitude: -24.6282, longitude: 25.9231, distance: 2.4, currentQueue: 45, estimatedWait: 60 },
  { id: 'c2', name: 'Block 6 Health Post', latitude: -24.6382, longitude: 25.9131, distance: 5.1, currentQueue: 12, estimatedWait: 15 },
  { id: 'c3', name: 'Tlokweng Clinic', latitude: -24.6582, longitude: 25.9531, distance: 8.7, currentQueue: 89, estimatedWait: 120 },
];

export default function PatientScreen() {
  const { user, logout } = useAuth();
  const [clinics] = useState(MOCK_CLINICS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color="#9ca3af" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
      >
        <BookAppointment clinics={clinics} />
        <SymptomChecker />
        <MyClinics clinics={clinics} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#011c16' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  greeting: { color: '#6b7280', fontSize: 13, fontWeight: '500' },
  userName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
});
