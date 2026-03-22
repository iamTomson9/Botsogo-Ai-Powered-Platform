import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import clinicsData from '../../clinics.json';

export default function ClinicsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clinics, setClinics] = useState<any[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial clinics (limit to 50 for performance)
    const activeClinics = (clinicsData as any[]).filter(c => c.operationalStatus?.display === 'Active').slice(0, 100);
    setClinics(activeClinics);
    setFilteredClinics(activeClinics);
    setLoading(false);
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = clinics.filter(c => 
      c.name?.toLowerCase().includes(query) || 
      c.address?.city?.toLowerCase().includes(query) ||
      c.address?.district?.toLowerCase().includes(query)
    );
    setFilteredClinics(filtered);
  }, [searchQuery, clinics]);

  const handleNavigate = (clinic: any) => {
    const { position, name } = clinic;
    if (!position?.latitude || !position?.longitude) {
      alert('Location coordinates not available for this clinic.');
      return;
    }

    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${position.latitude},${position.longitude}`;
    const label = name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  const renderClinicItem = ({ item }: { item: any }) => (
    <View style={styles.clinicCard}>
      <View style={styles.cardHeader}>
        <View style={styles.clinicInfo}>
          <Text style={styles.clinicName}>{item.name}</Text>
          <Text style={styles.clinicAddress}>
            {item.address?.city || item.address?.district || 'Botswana'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.navigateButton}
          onPress={() => handleNavigate(item)}
        >
          <FontAwesome5 name="directions" size={18} color="#fff" />
          <Text style={styles.navigateText}>Navigate</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.statusText}>Open Now</Text>
        </View>
        {item.contact?.telecom?.[0]?.value && (
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL(`tel:${item.contact.telecom[0].value}`)}
          >
            <Ionicons name="call-outline" size={16} color={Colors.light.primary} />
            <Text style={styles.contactText}>{item.contact.telecom[0].value}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Find Nearby Clinics</Text>
        <Text style={styles.subtitle}>Locate and navigate to the nearest health facility</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or district..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredClinics}
            renderItem={renderClinicItem}
            keyExtractor={(item, index) => item.identifier?.[0]?.value || index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <FontAwesome5 name="search-minus" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No clinics found matching your search.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  listContent: {
    paddingBottom: 20,
  },
  clinicCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clinicInfo: {
    flex: 1,
    marginRight: 12,
  },
  clinicName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 13,
    color: '#64748b',
  },
  navigateButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  navigateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
