import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers, updateUserRole, deleteUserDoc } from '../../services/userService';
import { Colors } from '../../constants/Colors';

export default function UserManagementScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: any) => {
    setIsUpdating(true);
    try {
      await updateUserRole(userId, newRole);
      Alert.alert("Success", "User role updated successfully.");
      setSelectedUser(null);
      loadUsers();
    } catch (e) {
      Alert.alert("Error", "Failed to update role.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (userId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to remove this user from the system? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            await deleteUserDoc(userId);
            loadUsers();
          } catch (e) {
            Alert.alert("Error", "Failed to delete user.");
          }
        }}
      ]
    );
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (role: string): any => {
    switch (role) {
      case 'admin': return 'shield-checkmark';
      case 'doctor': return 'medkit';
      case 'pharmacist': return 'bandage';
      default: return 'person';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'doctor': return Colors.light.primary;
      case 'pharmacist': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Ionicons name="refresh" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.light.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.cardInfo}>
                <View style={[styles.roleIcon, { backgroundColor: getRoleColor(item.role) + '15' }]}>
                  <Ionicons name={getRoleIcon(item.role)} size={20} color={getRoleColor(item.role)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.name || 'No Name'}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedUser(item)}>
                    <Ionicons name="create-outline" size={18} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtnAlert} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '15' }]}>
                <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role.toUpperCase()}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Edit Role Modal */}
      <Modal visible={!!selectedUser} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage User</Text>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Change Role for {selectedUser?.name}</Text>
              {['patient', 'doctor', 'pharmacist', 'admin'].map((role) => (
                <TouchableOpacity 
                  key={role} 
                  style={[styles.roleOption, selectedUser?.role === role && styles.roleOptionActive]}
                  onPress={() => handleRoleChange(selectedUser.id, role)}
                  disabled={isUpdating}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name={getRoleIcon(role)} size={18} color={selectedUser?.role === role ? '#fff' : '#64748b'} />
                    <Text style={[styles.roleOptionText, selectedUser?.role === role && { color: '#fff', fontWeight: 'bold' }]}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </View>
                  {isUpdating && selectedUser?.role === role && <ActivityIndicator color="#fff" size="small" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  roleIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 10, backgroundColor: '#f1f5f9', borderRadius: 10 },
  actionBtnAlert: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 10 },
  roleBadge: { alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '800' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  modalBody: { gap: 14 },
  label: { fontSize: 15, fontWeight: '700', color: '#64748b', marginBottom: 8 },
  roleOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 16, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  roleOptionActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  roleOptionText: { fontSize: 16, color: '#334155', fontWeight: '600' },
});
