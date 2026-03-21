import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Clock, PlayCircle, User, CheckCircle2 } from "lucide-react-native";

const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  waiting: { color: "#F59E0B", icon: Clock },
  consultation: { color: "#10B981", icon: PlayCircle },
  completed: { color: "#5BAFB8", icon: CheckCircle2 },
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
      <View style={styles.header}>
        <Text style={styles.title}>Patient Queue</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{queue.length} Pending</Text>
        </View>
      </View>

      {queue.map((patient) => {
        const Config = STATUS_CONFIG[patient.status] || STATUS_CONFIG.waiting;
        const StatusIcon = Config.icon;

        return (
          <TouchableOpacity
            key={patient.id}
            style={[styles.patientCard, selected === patient.id && styles.patientCardActive]}
            onPress={() => handleSelect(patient)}
          >
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: selected === patient.id ? "#5BAFB8" : "#F3F4F6" }]}>
                {selected === patient.id ? (
                  <User color="#FFF" size={20} />
                ) : (
                  <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
                )}
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientSymptoms} numberOfLines={1}>{patient.symptoms}</Text>
              </View>
              <View style={styles.meta}>
                <StatusIcon color={Config.color} size={16} />
                <Text style={[styles.waitText, { color: Config.color }]}>{patient.waitTime}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "800", color: "#000" },
  badge: { backgroundColor: "#F0F9FA", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#5BAFB8", textTransform: "uppercase" },
  patientCard: {
    padding: 16, borderRadius: 20, borderWidth: 1,
    borderColor: "#E5E7EB", backgroundColor: "#FFF", marginBottom: 12,
  },
  patientCardActive: { borderColor: "#5BAFB8", backgroundColor: "#F0F9FA" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#828282", fontWeight: "700", fontSize: 16 },
  patientInfo: { flex: 1 },
  patientName: { color: "#000", fontWeight: "700", fontSize: 15, marginBottom: 2 },
  patientSymptoms: { color: "#828282", fontSize: 12, fontWeight: "500" },
  meta: { alignItems: "flex-end", gap: 4 },
  waitText: { fontSize: 12, fontWeight: "700" },
});

