import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { UserCircle, Mail, Briefcase, LogOut, Edit2, Calendar, Users, Save, X } from 'lucide-react-native';

export default function DoctorProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);

    if (result?.success) {
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: user?.name || '',
      dob: user?.dob || '',
      gender: user?.gender || '',
    });
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Account</Text>
        {!isEditing ? (
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
            <Edit2 size={20} color="#5BAFB8" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerActions}>
             <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                <X size={20} color="#6B7280" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Save size={20} color="#FFF" />}
             </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <UserCircle size={20} color="#5BAFB8" />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Medical Practitioner</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter name"
                />
              ) : (
                <Text style={styles.value}>Dr. {user?.name || 'Staff'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#5BAFB8" />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Date of Birth</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.dob}
                  onChangeText={(text) => setFormData({ ...formData, dob: text })}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Text style={styles.value}>{user?.dob || 'Not set'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Users size={20} color="#5BAFB8" />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Gender</Text>
              {isEditing ? (
                <View style={styles.genderContainer}>
                  {['Male', 'Female', 'Other'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderOption, formData.gender === g && styles.genderOptionActive]}
                      onPress={() => setFormData({ ...formData, gender: g })}
                    >
                      <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.value}>{user?.gender || 'Not set'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={20} color="#5BAFB8" />
            <View>
              <Text style={styles.label}>Institutional Email</Text>
              <Text style={styles.value}>{user?.email || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Briefcase size={20} color="#5BAFB8" />
            <View>
              <Text style={styles.label}>Department</Text>
              <Text style={styles.value}>General Medicine</Text>
            </View>
          </View>
        </View>

        {!isEditing && (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <LogOut size={20} color="#FF4B4B" />
            <Text style={styles.logoutText}>Secure Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { 
    padding: 24, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 24, fontWeight: '700', color: '#000' },
  editBtn: { padding: 8 },
  headerActions: { flexDirection: 'row', gap: 12 },
  saveBtn: { backgroundColor: '#5BAFB8', padding: 8, borderRadius: 8 },
  cancelBtn: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 },
  content: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, gap: 20, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  label: { fontSize: 12, color: '#828282', fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 16, color: '#000', fontWeight: '600' },
  input: { 
    fontSize: 16, 
    color: '#000', 
    fontWeight: '600', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB', 
    paddingVertical: 4 
  },
  genderContainer: { flexDirection: 'row', gap: 8, marginTop: 4 },
  genderOption: { 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  genderOptionActive: { backgroundColor: '#5BAFB8', borderColor: '#5BAFB8' },
  genderText: { fontSize: 14, color: '#6B7280' },
  genderTextActive: { color: '#FFF', fontWeight: '600' },
  logoutBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FFE5E5' 
  },
  logoutText: { color: '#FF4B4B', fontWeight: '600' }
});
