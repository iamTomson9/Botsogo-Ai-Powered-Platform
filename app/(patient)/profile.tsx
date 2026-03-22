import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPatientInsights, generatePatientInsights } from '../../services/patientService';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

export default function PatientProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
  });

  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    fetchInsights(user.uid);
  }, [user]);

  const fetchInsights = async (uid: string) => {
    setLoadingInsights(true);
    const data = await getPatientInsights(uid);
    setAiInsights(data);
    setLoadingInsights(false);
  };

  const handleGenerateInsights = async () => {
    if (!user?.uid) return;
    setLoadingInsights(true);
    try {
      const summary = await generatePatientInsights(user.uid);
      await fetchInsights(user.uid);
      Alert.alert("Success", "Personalized health analysis updated!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update analysis.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Full name is required');
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

  const InfoRow = ({ label, value, icon, editable, field }: { label: string, value: any, icon: any, editable: boolean, field: 'name' | 'dob' | 'gender' }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color={Colors.light.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={styles.input}
            value={formData[field]}
            onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          />
        ) : (
          <Text style={styles.value}>{value || 'Not set'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={Colors.light.primary} /> : <Text style={styles.saveText}>Save</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHero}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name || 'Patient'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <InfoRow label="Full Name" value={user?.name} icon="person-outline" editable field="name" />
            <InfoRow label="Date of Birth" value={user?.dob} icon="calendar-outline" editable field="dob" />
            <InfoRow label="Gender" value={user?.gender} icon="transgender-outline" editable field="gender" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Health Analysis</Text>
            <TouchableOpacity onPress={handleGenerateInsights} disabled={loadingInsights}>
              <Ionicons name="refresh" size={18} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.card, styles.aiCard]}>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="robot-outline" size={16} color="#fff" />
              <Text style={styles.aiBadgeText}>INTELLECT</Text>
            </View>
            {loadingInsights ? (
              <ActivityIndicator size="small" color={Colors.light.primary} style={{ padding: 20 }} />
            ) : aiInsights ? (
              <Text style={styles.aiText}>{aiInsights.summary}</Text>
            ) : (
              <TouchableOpacity style={styles.aiEmptyBtn} onPress={handleGenerateInsights}>
                <Text style={styles.aiEmptyText}>Generate medical history analysis</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  editText: { color: Colors.light.primary, fontWeight: '700', fontSize: 16 },
  saveText: { color: '#10b981', fontWeight: '700', fontSize: 16 },
  scrollContent: { paddingBottom: 40 },
  profileHero: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.light.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: Colors.light.primary, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: '800' },
  profileName: { fontSize: 22, fontWeight: '700', color: '#0f172a' },
  profileEmail: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.light.primary + '10', justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 11, color: '#94a3b8', fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  value: { fontSize: 15, color: '#1e293b', fontWeight: '600' },
  input: { fontSize: 15, color:Colors.light.primary, fontWeight: '600', paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: Colors.light.primary + '40' },
  aiCard: { backgroundColor: '#0f172a' },
  aiBadge: { backgroundColor: Colors.light.primary, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, marginBottom: 12 },
  aiBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  aiText: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },
  aiEmptyBtn: { padding: 20, alignItems: 'center' },
  aiEmptyText: { color: Colors.light.primary, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, padding: 16, borderRadius: 20, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
});
