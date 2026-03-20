import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

const STATUS_COLORS: Record<string, string> = {
  waiting: "#f59e0b",
  consultation: "#10b981",
};

export default function PatientQueue({
  queue,
  onSelectPatient,
}: {
  queue: any[];
  onSelectPatient: (patient: any) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (patient: any) => {
    setSelected(patient.id);
    onSelectPatient(patient);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Patient Queue</Text>
      <Text style={styles.subtitle}>{queue.length} patients pending</Text>

      {queue.map((patient) => (
        <TouchableOpacity
          key={patient.id}
          style={[styles.patientCard, selected === patient.id && styles.patientCardActive]}
          onPress={() => handleSelect(patient)}
        >
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: selected === patient.id ? "#10b981" : "rgba(255,255,255,0.1)" }]}>
              <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientSymptoms} numberOfLines={1}>{patient.symptoms}</Text>
            </View>
          </View>

          <View style={styles.patientMeta}>
            <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[patient.status]}20`, borderColor: `${STATUS_COLORS[patient.status]}40` }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[patient.status] }]}>
                {patient.status}
              </Text>
            </View>
            <Text style={styles.waitText}>⏱ {patient.waitTime}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, padding: 20,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#6b7280", fontWeight: "500", marginBottom: 16 },
  patientCard: {
    padding: 14, borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(0,0,0,0.3)", marginBottom: 10,
  },
  patientCardActive: { borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.1)" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  patientInfo: { flex: 1 },
  patientName: { color: "#fff", fontWeight: "700", fontSize: 15 },
  patientSymptoms: { color: "#9ca3af", fontSize: 12, fontWeight: "500" },
  patientMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  waitText: { color: "#9ca3af", fontSize: 12, fontWeight: "600" },
});
