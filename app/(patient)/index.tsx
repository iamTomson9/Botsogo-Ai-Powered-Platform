import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function PatientDashboard() {
  const router = useRouter();

  const ActionCard = ({ title, icon, onPress, description }: any) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name={icon} size={28} color={Colors.light.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <FontAwesome5 name="chevron-right" size={16} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Patient</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
        </View>

        <View style={styles.actionsContainer}>
          <ActionCard 
            title="AI Symptom Checker" 
            icon="robot"
            description="Describe how you feel, and our AI will guide you."
            onPress={() => router.push('/(patient)/symptom-checker')} 
          />
          <ActionCard 
            title="Find Nearby Clinics" 
            icon="map-marker-alt"
            description="Locate health facilities based on your condition."
            onPress={() => router.push('/(patient)/clinics')} 
          />
          <ActionCard 
            title="Book Appointment" 
            icon="calendar-plus"
            description="Reserve your spot at a nearby hospital or clinic."
            onPress={() => router.push('/(patient)/book-appointment' as any)} 
          />
          <ActionCard 
            title="My Queue" 
            icon="clipboard-list"
            description="Track your position and estimated wait time."
            onPress={() => router.push('/(patient)/my-queue' as any)} 
          />
          <ActionCard 
            title="Health Records" 
            icon="file-medical"
            description="Access your medical history and documents."
            onPress={() => router.push('/(patient)/records' as any)} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9', // Slate-100
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a', // Slate-900
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b', // Slate-500
  },
  actionsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b', // Slate-800
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748b', // Slate-500
  },
});
