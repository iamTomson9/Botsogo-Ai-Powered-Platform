import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import PatientQueue from "../../components/Doctor/PatientQueue";
import Consultation from "../../components/Doctor/Consultation";
import { ClipboardList, UserRound } from "lucide-react-native";

export default function DoctorDashboard() {
  const [activePatient, setActivePatient] = useState<any>(null);

  const mockQueue = [
    { id: "p1", name: "Thabo Molefe", status: "waiting", waitTime: "15 min", symptoms: "Headache, persistent fever" },
    { id: "p2", name: "Lesedi Nkosi", status: "consultation", waitTime: "0 min", symptoms: "Routine checkup" },
    { id: "p3", name: "Kagiso Phiri", status: "waiting", waitTime: "45 min", symptoms: "Abdominal pain" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Patient Workflow</Text>

      {/* Queue Section */}
      <View style={styles.section}>
        <PatientQueue queue={mockQueue} onSelectPatient={setActivePatient} />
      </View>

      {/* Consultation Area */}
      <View style={styles.section}>
        {activePatient ? (
          <Consultation patient={activePatient} onComplete={() => setActivePatient(null)} />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <UserRound color="#5BAFB8" size={36} />
            </View>
            <Text style={styles.emptyTitle}>No Active Patient</Text>
            <Text style={styles.emptySubtitle}>
              Select a patient from the queue above to start a digital consultation.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  content: { paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: "800", color: "#000", marginBottom: 20 },
  section: { marginBottom: 20 },
  emptyState: {
    backgroundColor: "#FFF",
    borderRadius: 24, padding: 40, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#F0F9FA",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#000", marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: "#828282", fontWeight: "500", textAlign: "center", lineHeight: 22 },
});

