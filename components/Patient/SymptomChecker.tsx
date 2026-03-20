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
import { useAuth } from "../../hooks/useAuth";
import { addSymptomInput } from "../../services/firestoreService";
import { Activity } from "lucide-react-native";

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);

    setTimeout(async () => {
      const mockResponse = {
        messages: [
          {
            text: "Based on your symptoms, this appears to be a common mild reaction. Please rest, stay hydrated, and monitor your temperature.",
          },
        ],
        severity: "mild",
      };
      try {
        if (user) await addSymptomInput(user.uid, symptoms, mockResponse.severity);
        setAiResponse(mockResponse);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Activity color="#60a5fa" size={22} />
        </View>
        <Text style={styles.title}>AI Assessment</Text>
      </View>

      <Text style={styles.label}>Describe Your Condition</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="e.g., headache and fever since yesterday morning..."
        placeholderTextColor="#4b5563"
        value={symptoms}
        onChangeText={setSymptoms}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Run AI Diagnostics</Text>
        )}
      </TouchableOpacity>

      {aiResponse && (
        <View style={styles.result}>
          <View style={styles.resultHeader}>
            <View style={styles.pulseDot} />
            <Text style={styles.resultLabel}>Diagnostic Insight:</Text>
          </View>
          <Text style={styles.resultText}>"{aiResponse.messages?.[0]?.text}"</Text>
          <View style={styles.divider} />
          <Text style={styles.disclaimer}>
            Disclaimer: Provided by Botsogo AI. Please confer with a real doctor.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, padding: 20, marginBottom: 16,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  iconBox: {
    padding: 8, backgroundColor: "rgba(59,130,246,0.15)",
    borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#fff" },
  label: { color: "#9ca3af", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 },
  textArea: {
    backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 14, color: "#fff", fontSize: 14, fontWeight: "500",
    minHeight: 100, marginBottom: 14,
  },
  btn: {
    backgroundColor: "#3b82f6", borderRadius: 14, padding: 14,
    alignItems: "center",
    shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  result: {
    marginTop: 14, padding: 16,
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1, borderColor: "rgba(59,130,246,0.3)",
    borderRadius: 16,
  },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#60a5fa" },
  resultLabel: { color: "#60a5fa", fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.5 },
  resultText: { color: "#e5e7eb", fontSize: 14, fontWeight: "500", lineHeight: 22, marginBottom: 10 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginBottom: 10 },
  disclaimer: { color: "#6b7280", fontSize: 11, fontStyle: "italic", fontWeight: "500" },
});
