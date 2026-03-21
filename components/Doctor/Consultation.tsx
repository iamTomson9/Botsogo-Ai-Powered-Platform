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
import { User, ClipboardList, Sparkles, CheckCircle2, ArrowRight, RotateCcw } from "lucide-react-native";

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
      <View style={styles.successCard}>
        <View style={styles.successIcon}>
          <CheckCircle2 color="#fff" size={40} />
        </View>
        <Text style={styles.successTitle}>Consultation Complete</Text>
        <Text style={styles.successSub}>The patient's digital health record has been updated successfully.</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={onComplete}>
          <RotateCcw color="#5BAFB8" size={18} />
          <Text style={styles.doneBtnText}>Return to Queue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.heading}>Active Consultation</Text>
        
        <View style={styles.patientBadge}>
          <View style={styles.avatar}>
            <User color="#5BAFB8" size={24} />
          </View>
          <View style={styles.patientMeta}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientSymptoms}>{patient.symptoms}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <ClipboardList color="#5BAFB8" size={16} />
            <Text style={styles.label}>Clinical Notes</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Describe clinical observations, vitals, and findings..."
            placeholderTextColor="#828282"
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Diagnosis & Recommendation</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mild viral infection, prescribed rest"
            placeholderTextColor="#828282"
            value={diagnosis}
            onChangeText={setDiagnosis}
          />
        </View>

        <View style={styles.aiHint}>
          <View style={styles.aiHeader}>
            <Sparkles color="#5BAFB8" size={16} />
            <Text style={styles.aiTitle}>AI Diagnostic Insights</Text>
          </View>
          <Text style={styles.aiHintText}>
            Consider ruling out viral pharyngitis based on symptom duration. Patient history suggests seasonal sensitivity.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.completeBtn, (loading || !notes.trim()) && { opacity: 0.6 }]}
          onPress={handleComplete}
          disabled={loading || !notes.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.completeBtnText}>End Consultation</Text>
              <ArrowRight color="#fff" size={20} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24, padding: 24, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  successCard: {
    backgroundColor: "#FFF",
    borderRadius: 24, padding: 40, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  heading: { fontSize: 20, fontWeight: "800", color: "#000", marginBottom: 20 },
  patientBadge: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 18, borderRadius: 20,
    backgroundColor: "#F0F9FA", borderWidth: 1, borderColor: "#CFE8EB",
    marginBottom: 24,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  patientMeta: { flex: 1 },
  patientName: { color: "#000", fontWeight: "700", fontSize: 16, marginBottom: 2 },
  patientSymptoms: { color: "#5BAFB8", fontSize: 13, fontWeight: "600" },
  section: { marginBottom: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  label: { color: "#000", fontSize: 13, fontWeight: "600" },
  textArea: {
    backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 16, padding: 16, color: "#000", fontSize: 15, fontWeight: "500", minHeight: 120,
  },
  input: {
    backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 50, paddingHorizontal: 20, height: 50, color: "#000", fontSize: 15, fontWeight: "500",
  },
  aiHint: {
    marginTop: 8, padding: 20, borderRadius: 20,
    backgroundColor: "#F0F9FA", borderWidth: 1, borderColor: "#CFE8EB",
  },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  aiTitle: { color: "#5BAFB8", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  aiHintText: { color: "#000", fontSize: 14, fontWeight: "500", lineHeight: 20 },
  completeBtn: {
    backgroundColor: "#5BAFB8", borderRadius: 50, height: 56,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    marginTop: 24, shadowColor: "#5BAFB8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  completeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#5BAFB8", alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#000", marginBottom: 12 },
  successSub: { fontSize: 14, color: "#828282", fontWeight: "500", marginBottom: 32, textAlign: "center", lineHeight: 22 },
  doneBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F0F9FA", borderWidth: 1, borderColor: "#5BAFB8",
    borderRadius: 50, paddingHorizontal: 24, height: 48,
  },
  doneBtnText: { color: "#5BAFB8", fontWeight: "700", fontSize: 15 },
});

