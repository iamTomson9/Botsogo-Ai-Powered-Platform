import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from '../../components/Admin/AdminDashboard';
import { LogOut } from 'lucide-react-native';

export default function AdminScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Administrator</Text>
          <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut color="#9ca3af" size={20} />
        </TouchableOpacity>
      </View>
      <AdminDashboard />
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
});
