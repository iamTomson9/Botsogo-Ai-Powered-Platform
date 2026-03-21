import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TEAL = '#0E7490';

export default function PharmacistMessages() {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // Fetch both doctors and patients
        const [doctorSnap, patientSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('role', '==', 'doctor'))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'patient'))),
        ]);

        const doctors = doctorSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          lastMessage: 'Tap to start conversation...',
        }));
        const patients = patientSnap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          lastMessage: 'Tap to start conversation...',
        }));

        setContacts([...doctors, ...patients]);
      } catch (e) {
        console.error('Error fetching contacts', e);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const getIcon = (role: string) => role === 'doctor' ? 'user-md' : 'user';
  const getColor = (role: string) => role === 'doctor' ? '#6d28d9' : TEAL;

  const renderContact = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/(pharmacist)/chat/[id]', params: { id: item.id, name: item.name } } as any)}
    >
      <View style={[styles.avatar, { backgroundColor: getColor(item.role) + '20' }]}>
        <FontAwesome5 name={getIcon(item.role)} size={22} color={getColor(item.role)} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <Text style={styles.roleLabel}>
          {item.role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑 Patient'}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <FontAwesome5 name="chevron-right" size={14} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={TEAL} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={item => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>
              No doctors or patients found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f9ff' },
  header: {
    padding: 20, backgroundColor: TEAL,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, zIndex: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: '#a5f3fc', marginTop: 4 },
  listContent: { padding: 20, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    gap: 14,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  roleLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  preview: { fontSize: 13, color: '#94a3b8' },
});
