import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, Mail, Settings, LogOut } from 'lucide-react-native';

export default function AdminSettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Settings</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <ShieldCheck size={20} color="#5BAFB8" />
            <View>
              <Text style={styles.label}>Administrator</Text>
              <Text style={styles.value}>{user?.name || 'Admin'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Mail size={20} color="#5BAFB8" />
            <View>
              <Text style={styles.label}>Admin Email</Text>
              <Text style={styles.value}>{user?.email || 'Not set'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Settings size={20} color="#5BAFB8" />
            <View>
              <Text style={styles.label}>Access Level</Text>
              <Text style={styles.value}>Super Admin</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <LogOut size={20} color="#FF4B4B" />
          <Text style={styles.logoutText}>Admin Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { padding: 24, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: '700', color: '#000' },
  content: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, gap: 20, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  label: { fontSize: 12, color: '#828282', fontWeight: '500' },
  value: { fontSize: 16, color: '#000', fontWeight: '600' },
  logoutBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FFE5E5' 
  },
  logoutText: { color: '#FF4B4B', fontWeight: '600' }
});
