import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { useClinicStore } from '../../store/useClinicStore';
import { useAuth } from '../../hooks/useAuth';

export default function ClinicFinder() {
  const { filteredClinics, searchQuery, setSearchQuery, setClinics, setUserLocation, userLocation } = useClinicStore();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Load clinics data if empty
    const loadData = async () => {
      try {
        if (filteredClinics.length === 0) {
          const clinicData = require('../../clinics.json'); // Direct importing the local dataset
          setClinics(clinicData);
        }
      } catch (err) {
        console.error('Failed to load clinic dataset', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied. Clinics will not be sorted by distance.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
      };
      setUserLocation(coords);
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Automatically assign nearest clinic if user is a patient and hasn't been assigned one yet
  useEffect(() => {
      if (user?.role === 'patient' && !user.assignedClinicId && filteredClinics.length > 0 && userLocation) {
          const nearestClinic = filteredClinics[0];
          const clinicId = nearestClinic.identifier?.[0]?.value || nearestClinic.name;
          if (clinicId) {
              updateProfile({ assignedClinicId: clinicId });
          }
      }
  }, [user, filteredClinics, userLocation]);

  const renderClinicItem = ({ item }: { item: any }) => {
    const isAssigned = user?.assignedClinicId === (item.identifier?.[0]?.value || item.name);
    
    return (
        <View style={[styles.clinicCard, isAssigned && styles.assignedCard]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.clinicName}>{item.name || item.managingOrganization?.display || 'Unnamed Clinic'}</Text>
              {isAssigned && (
                  <View style={styles.assignedBadge}>
                    <Text style={styles.assignedBadgeText}>Your Assigned Clinic</Text>
                  </View>
              )}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.operationalStatus?.display === 'Active' ? '#dcfce7' : '#fee2e2' }]}>
              <Text style={[styles.statusText, { color: item.operationalStatus?.display === 'Active' ? '#166534' : '#991b1b' }]}>
                {item.operationalStatus?.display || 'Unknown'}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardRow}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#64748b" style={styles.icon} />
            <Text style={styles.addressText}>
                {item.address?.city ? `${item.address.city}, ` : ''}{item.address?.district ? `${item.address.district}, ` : ''}{item.address?.country}
                {item.distance && item.distance !== Infinity && (
                    <Text style={styles.distanceText}> • {item.distance.toFixed(1)} km away</Text>
                )}
            </Text>
          </View>
    
          {item.contact?.telecom?.[0]?.value && (
            <View style={styles.cardRow}>
              <FontAwesome5 name="phone" size={14} color="#64748b" style={styles.icon} />
              <Text style={styles.contactText}>{item.contact.telecom[0].value}</Text>
            </View>
          )}
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Find a Clinic</Text>
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, city, or district..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {locationLoading && <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginLeft: 8 }} />}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading facilities...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredClinics.slice(0, 50)} // Slice for performance, usually you'd paginate
          keyExtractor={(item, index) => item.identifier?.[0]?.value || `clinic-${index}`}
          renderItem={renderClinicItem}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.center}>
              <FontAwesome5 name="hospital-symbol" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No clinics found matching.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#334155',
  },
  listContent: {
    padding: 20,
    paddingTop: 16,
  },
  clinicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  assignedCard: {
    borderColor: Colors.light.primary,
    backgroundColor: '#f0fdfa',
  },
  assignedBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  assignedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clinicName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  icon: {
    width: 20,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
  },
  distanceText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  contactText: {
    fontSize: 14,
    color: '#0f766e',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 16,
  },
});
