import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Fixed path
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';

export default function PatientMessages() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchActiveConsultations();
  }, [user]);

  const fetchActiveConsultations = async () => {
    if (!user?.uid) return;
    try {

      const apptQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', user.uid),
        where('status', 'in', ['consulting', 'waiting', 'in-progress'])
      );
      const apptSnap = await getDocs(apptQuery);
      const activeDoctorIds = [...new Set(apptSnap.docs.map(doc => doc.data().acceptedBy?.id).filter(Boolean))];

      if (activeDoctorIds.length === 0) {
        setDoctors([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'doctor'), 
        where('__name__', 'in', activeDoctorIds)
      );
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        const appt = apptSnap.docs.find(a => a.data().acceptedBy?.id === doc.id)?.data();
        return {
          id: doc.id,
          name: docData.name,
          specialty: docData.specialty || 'General Practitioner',
          status: appt?.status || 'Active',
          lastMessage: 'Tap to join consultation',
          unread: 0,
          updatedAt: appt?.updatedAt?.toDate() || new Date(),
        };
      });
      setDoctors(fetched);
    } catch (e) {
      console.error("Error fetching doctors", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderConversation = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push({ pathname: '/(patient)/chat/[id]', params: { id: item.id, name: item.name } } as any)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <FontAwesome5 name="user-md" size={24} color={Colors.light.primary} />
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: item.status === 'consulting' ? '#10b981' : '#f59e0b' }]} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>
            {item.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={styles.specialty}>{item.specialty}</Text>
        
        <View style={styles.footerRow}>
          <View style={[styles.statusBadge, { backgroundColor: (item.status === 'consulting' ? '#10b981' : '#f59e0b') + '15' }]}>
            <Text style={[styles.statusBadgeText, { color: item.status === 'consulting' ? '#10b981' : '#f59e0b' }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={item => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No active consultations found.</Text>
              <TouchableOpacity 
                style={styles.startBtn}
                onPress={() => router.push('/(patient)/symptom-checker')}
              >
                <Text style={styles.startBtnText}>Start Triage</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1e293b' },
  listContent: { padding: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center', alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute', bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: '#fff',
  },
  cardBody: { flex: 1, marginLeft: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  time: { fontSize: 12, color: '#94a3b8' },
  specialty: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#64748b', fontWeight: '500' },
  startBtn: { marginTop: 20, backgroundColor: Colors.light.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
