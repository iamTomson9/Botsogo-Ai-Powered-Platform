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
import { LogOut, User as UserIcon } from 'lucide-react-native';

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
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <UserIcon color="#5BAFB8" size={24} />
          </View>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{user?.name || 'Patient'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color="#828282" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#5BAFB8" />}
      >
        <BookAppointment clinics={clinics} />
        <SymptomChecker />
        <MyClinics clinics={clinics} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F8F8' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F0F4F7',
    alignItems: 'center', justifyContent: 'center',
  },
  greeting: { color: '#828282', fontSize: 13, fontWeight: '500' },
  userName: { color: '#000', fontSize: 18, fontWeight: '700' },
  logoutBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
});

