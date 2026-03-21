import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Colors } from '../../constants/Colors';

export default function DoctorMessages() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'patient'));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastMessage: 'Tap to start conversation...',
          unread: 0,
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

  const renderConversation = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push({ pathname: '/(doctor)/chat/[id]', params: { id: item.id, name: item.name } } as any)}
    >
      <View style={styles.avatar}>
        <FontAwesome5 name="user" size={24} color={Colors.light.secondary} />
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
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.secondary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={patients}
          keyExtractor={item => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>No registered patients found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    padding: 20,
    backgroundColor: Colors.light.secondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    zIndex: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  listContent: { padding: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  cardBody: { flex: 1, justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  time: { fontSize: 12, color: '#94a3b8' },
  timeUnread: { color: Colors.light.secondary, fontWeight: '600' },
  role: { fontSize: 13, color: Colors.light.secondary, marginBottom: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preview: { flex: 1, fontSize: 14, color: '#64748b', paddingRight: 12 },
  previewUnread: { fontWeight: '600', color: '#334155' },
  badge: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 12, minWidth: 24, height: 24,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
