import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getAuth } from 'firebase/auth';
import { collection, query, where, limit, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getPatientInsights, generatePatientInsights, PatientInsight } from '../../services/patientService';

const { width } = Dimensions.get('window');

export default function PatientDashboard() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [insight, setInsight] = useState<PatientInsight | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    fetchActiveAppointment();
    
    // Subscribe to AI insights
    const insightRef = doc(db, 'patient_insights', user.uid);
    const unsub = onSnapshot(insightRef, (snap) => {
      if (snap.exists()) {
        setInsight(snap.data() as PatientInsight);
      }
    });

    return () => unsub();
  }, [user]);

  const fetchActiveAppointment = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', user.uid),
        where('status', 'in', ['waiting', 'consulting'])
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        // Sort by createdAt desc client-side
        const sorted = docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setActiveAppointment(sorted[0]);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const handleRunAudit = async () => {
    if (!user) return;
    setIsAuditing(true);
    try {
      await generatePatientInsights(user.uid);
      // onSnapshot will handle the state update
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const BentoCard = ({ title, icon, color, size, onPress, subtitle }: any) => (
    <TouchableOpacity 
      style={[
        styles.bentoCard, 
        { width: size === 'large' ? '100%' : (width - 56) / 2, height: size === 'large' ? 120 : 160 }
      ]} 
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={size === 'large' ? 32 : 24} color={color} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.bentoTitle}>{title}</Text>
        {subtitle && <Text style={styles.bentoSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.displayName || 'Patient'}</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/(patient)/profile' as any)}>
            <Ionicons name="person-circle-outline" size={45} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {activeAppointment ? (
          <TouchableOpacity 
            style={styles.heroCard}
            onPress={() => router.push('/(patient)/my-queue')}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>Active Session</Text>
              </View>
              <Text style={styles.heroTitle}>
                {activeAppointment.status === 'consulting' ? 'Ongoing Consultation' : 'Waiting in Queue'}
              </Text>
              <Text style={styles.heroSubtitle}>Position: {activeAppointment.queuePosition || 'Calculating...'}</Text>
            </View>
            <View style={styles.heroAction}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.heroCard, { backgroundColor: '#0f172a' }]}
            onPress={() => router.push('/(patient)/symptom-checker')}
          >
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle, { color: '#fff' }]}>How are you feeling?</Text>
              <Text style={[styles.heroSubtitle, { color: '#94a3b8' }]}>Start a quick AI symptom check-up now.</Text>
            </View>
            <View style={[styles.heroIconCircle, { backgroundColor: Colors.light.primary }]}>
              <Ionicons name="sparkles" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.bentoGrid}>
          <BentoCard 
            size="large"
            title="Symptom Checker"
            subtitle="Analyze your symptoms with AI"
            icon="pulse-outline"
            color="#0ea5e9"
            onPress={() => router.push('/(patient)/symptom-checker')}
          />
          <BentoCard 
            title="Clinics"
            subtitle="Nearby facilities"
            icon="location-outline"
            color="#10b981"
            onPress={() => router.push('/(patient)/clinics')}
          />
          <BentoCard 
            title="My Queue"
            subtitle="Live wait times"
            icon="time-outline"
            color="#f59e0b"
            onPress={() => router.push('/(patient)/my-queue')}
          />
          <BentoCard 
            title="Records"
            subtitle="Clinical history"
            icon="document-text-outline"
            color="#8b5cf6"
            onPress={() => router.push('/(patient)/records')}
          />
          <BentoCard 
            title="Support"
            subtitle="Direct messages"
            icon="chatbubbles-outline"
            color="#ec4899"
            onPress={() => router.push('/(patient)/messages')}
          />
        </View>

        <View style={styles.auditContainer}>
          <View style={styles.auditHeader}>
            <View style={styles.auditTitleBox}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.light.primary} />
              <Text style={styles.auditTitle}>Clinical AI Audit</Text>
            </View>
            <TouchableOpacity style={styles.refreshAudit} onPress={handleRunAudit} disabled={isAuditing}>
              {isAuditing ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <Ionicons name="refresh" size={18} color={Colors.light.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.auditText} numberOfLines={3}>
            {insight ? insight.summary : "No longitudinal audit generated yet. Request asystm scan to analyze your clinical history."}
          </Text>
          
          <TouchableOpacity 
            style={styles.auditAction}
            onPress={() => router.push('/(patient)/records')}
          >
            <Text style={styles.auditActionText}>Read Full Health Analysis</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileIcon: {
    padding: 4,
  },
  heroCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  heroContent: {
    flex: 1,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  heroAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  bentoCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    marginTop: 12,
  },
  bentoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  bentoSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  auditContainer: {
    marginTop: 32,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  auditTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  auditTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  refreshAudit: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  auditText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748b',
    marginBottom: 16,
    fontWeight: '500',
  },
  auditAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  auditActionText: {
    color: Colors.light.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});
