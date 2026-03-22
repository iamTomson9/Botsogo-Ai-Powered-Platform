import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'shield-alt';
      case 'doctor': return 'user-md';
      case 'pharmacist': return 'pills';
      default: return 'user';
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
          <FontAwesome5 name="sync" size={16} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={14} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={search}
          onChangeText={setSearch}
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
                <View style={[styles.roleIcon, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                  <FontAwesome5 name={getRoleIcon(item.role)} size={16} color={getRoleColor(item.role)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.name || 'No Name'}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedUser(item)}>
                    <FontAwesome5 name="edit" size={14} color="#64748b" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                    <FontAwesome5 name="trash-alt" size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.roleBadge}>
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
              <Text style={styles.modalTitle}>Manage User: {selectedUser?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <FontAwesome5 name="times" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Change Role</Text>
              {['patient', 'doctor', 'pharmacist', 'admin'].map((role) => (
                <TouchableOpacity 
                  key={role} 
                  style={[styles.roleOption, selectedUser?.role === role && styles.roleOptionActive]}
                  onPress={() => handleRoleChange(selectedUser.id, role)}
                  disabled={isUpdating}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <FontAwesome5 name={getRoleIcon(role)} size={14} color={selectedUser?.role === role ? '#fff' : '#64748b'} />
                    <Text style={[styles.roleOptionText, selectedUser?.role === role && { color: '#fff' }]}>
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
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1 },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  userEmail: { fontSize: 13, color: '#64748b' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 8 },
  roleBadge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: '#f8fafc' },
  roleText: { fontSize: 10, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  modalBody: { gap: 12 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  roleOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, backgroundColor: '#f1f5f9' },
  roleOptionActive: { backgroundColor: Colors.light.primary },
  roleOptionText: { fontSize: 15, color: '#334155', fontWeight: '500' },
});
