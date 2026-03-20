import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

export default function Consultation({
  patient,
  onComplete,
}: {
  patient: any;
  onComplete: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleComplete = () => {
    if (!notes.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1200);
  };

  if (submitted) {
    return (
      <View style={[styles.card, { alignItems: "center", justifyContent: "center", flex: 1 }]}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Consultation Complete</Text>
        <Text style={styles.successSub}>Patient record has been updated successfully.</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={onComplete}>
          <Text style={styles.doneBtnText}>Return to Queue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.card}>
        <Text style={styles.heading}>Active Consultation</Text>
        <View style={styles.patientBadge}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientSymptoms}>{patient.symptoms}</Text>
          </View>
        </View>

        <Text style={styles.label}>Clinical Notes</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={5}
          placeholder="Document clinical observations, vitals, and findings here..."
          placeholderTextColor="#4b5563"
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Preliminary Diagnosis</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Upper respiratory tract infection"
          placeholderTextColor="#4b5563"
          value={diagnosis}
          onChangeText={setDiagnosis}
        />

        <View style={styles.aiHint}>
          <Text style={styles.aiHintText}>
            🤖 Botsogo AI Suggestion: Based on patient history, consider ruling out viral pharyngitis. Prior interactions showed mild symptoms. Monitor for fever progression.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.completeBtn, loading && { opacity: 0.6 }]}
          onPress={handleComplete}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.completeBtnText}>Complete Consultation →</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, padding: 20, marginBottom: 16,
  },
  heading: { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 16 },
  patientBadge: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: "rgba(16,185,129,0.08)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)",
    marginBottom: 16,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  patientName: { color: "#fff", fontWeight: "700", fontSize: 15 },
  patientSymptoms: { color: "#9ca3af", fontSize: 12, fontWeight: "500" },
  label: { color: "#9ca3af", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 12 },
  textArea: {
    backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 14, color: "#fff", fontSize: 14, fontWeight: "500", minHeight: 100,
  },
  input: {
    backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 14, color: "#fff", fontSize: 14, fontWeight: "500",
  },
  aiHint: {
    marginTop: 16, padding: 14, borderRadius: 14,
    backgroundColor: "rgba(99,102,241,0.1)", borderWidth: 1, borderColor: "rgba(99,102,241,0.3)",
  },
  aiHintText: { color: "#a5b4fc", fontSize: 13, fontWeight: "500", lineHeight: 20 },
  completeBtn: {
    backgroundColor: "#10b981", borderRadius: 14, padding: 16,
    alignItems: "center", marginTop: 16,
    shadowColor: "#10b981", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  completeBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#10b981", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#10b981", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16,
  },
  checkmark: { fontSize: 32, color: "#fff", fontWeight: "700" },
  successTitle: { fontSize: 24, fontWeight: "800", color: "#10b981", marginBottom: 8 },
  successSub: { fontSize: 14, color: "#9ca3af", fontWeight: "500", marginBottom: 24, textAlign: "center" },
  doneBtn: {
    backgroundColor: "rgba(16,185,129,0.15)", borderWidth: 1, borderColor: "#10b981",
    borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14,
  },
  doneBtnText: { color: "#10b981", fontWeight: "700", fontSize: 15 },
});
