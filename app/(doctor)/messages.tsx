import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Colors } from '../../constants/Colors';

export default function DoctorMessages() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'patient'));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastMessage: 'Ready for consultation...',
          unread: 0,
          initials: (doc.data().name || 'P').split(' ').map((n:any) => n[0]).join('').toUpperCase().substring(0,2),
        }));
        setPatients(fetched);
      } catch (e) {
        console.error("Error fetching patients", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderConversation = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push({ pathname: '/(doctor)/chat/[id]', params: { id: item.id, name: item.name } } as any)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.initials}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={[styles.time, item.unread > 0 && styles.timeUnread]}>{item.time}</Text>
        </View>
        <Text style={styles.role}>{item.role}</Text>
        <View style={styles.footerRow}>
          <Text style={[styles.preview, item.unread > 0 && styles.previewUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Clinical Messaging</Text>
        <Text style={styles.subtitle}>{patients.length} registered patients</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients by name..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.secondary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={item => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <Ionicons name="chatbubbles-outline" size={64} color="#e2e8f0" />
               <Text style={styles.emptyText}>No patients found matching "{search}"</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    padding: 20,
    backgroundColor: Colors.light.secondary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: '#ccfbf1', marginTop: 4, fontWeight: '500' },
  searchContainer: { 
    paddingHorizontal: 20, 
    marginTop: -28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 15, elevation: 8,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1e293b', fontWeight: '500' },
  listContent: { padding: 20, paddingTop: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.light.secondary + '15',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.light.secondary },
  cardBody: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  time: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  timeUnread: { color: Colors.light.secondary, fontWeight: '700' },
  role: { fontSize: 12, color: Colors.light.secondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preview: { flex: 1, fontSize: 14, color: '#64748b', paddingRight: 10, fontWeight: '400' },
  previewUnread: { fontWeight: '700', color: '#334155' },
  badge: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 10, minWidth: 22, height: 22,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  emptyContainer: { alignItems: 'center', paddingVertical: 80, gap: 16 },
  emptyText: { color: '#94a3b8', fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
});
