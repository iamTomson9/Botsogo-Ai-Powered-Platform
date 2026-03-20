import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import PatientQueue from "../../components/Doctor/PatientQueue";
import Consultation from "../../components/Doctor/Consultation";
import { Activity } from "lucide-react-native";

export default function DoctorDashboard() {
  const [activePatient, setActivePatient] = useState<any>(null);

  const mockQueue = [
    { id: "p1", name: "Thabo Molefe", status: "waiting", waitTime: "15 min", symptoms: "Headache, persistent fever" },
    { id: "p2", name: "Lesedi Nkosi", status: "consultation", waitTime: "0 min", symptoms: "Routine checkup" },
    { id: "p3", name: "Kagiso Phiri", status: "waiting", waitTime: "45 min", symptoms: "Abdominal pain" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Doctor Workbench</Text>

      {/* Queue */}
      <PatientQueue queue={mockQueue} onSelectPatient={setActivePatient} />

      {/* Consultation or placeholder */}
      <View style={styles.section}>
        {activePatient ? (
          <Consultation patient={activePatient} onComplete={() => setActivePatient(null)} />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Activity color="#10b981" size={36} />
            </View>
            <Text style={styles.emptyTitle}>Select Active Case</Text>
            <Text style={styles.emptySubtitle}>
              Choose a pending patient from the queue above to begin a consultation.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#011c16" },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 16 },
  section: { marginTop: 4 },
  emptyState: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderStyle: "dashed",
    borderRadius: 20, padding: 40, alignItems: "center",
  },
  emptyIconBox: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: "#e5e7eb", marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: "#6b7280", fontWeight: "500", textAlign: "center", lineHeight: 22 },
});
