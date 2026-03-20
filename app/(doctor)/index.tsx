import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import DoctorDashboard from '../../components/Doctor/DoctorDashboard';
import { LogOut, User as UserIcon } from 'lucide-react-native';

export default function DoctorHomeScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <UserIcon color="#5BAFB8" size={24} />
          </View>
          <View>
            <Text style={styles.role}>Medical Staff</Text>
            <Text style={styles.userName}>Dr. {user?.name || 'Staff'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color="#828282" size={20} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        <DoctorDashboard />
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
  role: { color: '#828282', fontSize: 13, fontWeight: '500' },
  userName: { color: '#000', fontSize: 18, fontWeight: '700' },
  logoutBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  container: { flex: 1, padding: 20 },
});
