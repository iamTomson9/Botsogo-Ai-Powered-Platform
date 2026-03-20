import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { addSymptomInput } from "../../services/firestoreService";
import { Sparkles, Activity, AlertCircle, RefreshCcw } from "lucide-react-native";

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
          <Sparkles color="#5BAFB8" size={22} />
        </View>
        <Text style={styles.title}>AI Symptom Checker</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>How are you feeling?</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="e.g. I have a slight headache and dry cough for 2 days..."
          placeholderTextColor="#828282"
          value={symptoms}
          onChangeText={setSymptoms}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.btn, (loading || !symptoms.trim()) && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading || !symptoms.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Activity color="#fff" size={18} />
            <Text style={styles.btnText}>Analyze Symptoms</Text>
          </>
        )}
      </TouchableOpacity>

      {aiResponse && (
        <View style={styles.result}>
          <View style={styles.resultHeader}>
            <AlertCircle color="#5BAFB8" size={18} />
            <Text style={styles.resultLabel}>AI Assessment Results</Text>
          </View>
          <Text style={styles.resultText}>{aiResponse.messages?.[0]?.text}</Text>
          
          <TouchableOpacity style={styles.resetBtn} onPress={() => {setAiResponse(null); setSymptoms("");}}>
            <RefreshCcw color="#828282" size={14} />
            <Text style={styles.resetText}>Check new symptoms</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          <Text style={styles.disclaimer}>
            Note: This is an AI analysis and not a final medical diagnosis.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24, padding: 24, marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  iconBox: {
    width: 44, height: 44, backgroundColor: "#F0F9FA",
    borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#000" },
  section: { marginBottom: 16 },
  label: { color: "#000", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 2 },
  textArea: {
    backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 16, padding: 16, color: "#000", fontSize: 15, fontWeight: "500",
    minHeight: 120,
  },
  btn: {
    backgroundColor: "#5BAFB8", borderRadius: 50, height: 56,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    shadowColor: "#5BAFB8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  result: {
    marginTop: 20, padding: 20,
    backgroundColor: "#F0F9FA",
    borderWidth: 1, borderColor: "#CFE8EB",
    borderRadius: 20,
  },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  resultLabel: { color: "#5BAFB8", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  resultText: { color: "#000", fontSize: 15, fontWeight: "500", lineHeight: 22, marginBottom: 16 },
  resetBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  resetText: { color: "#828282", fontSize: 13, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#CFE8EB", marginBottom: 12 },
  disclaimer: { color: "#828282", fontSize: 11, fontStyle: "italic", fontWeight: "500", textAlign: "center" },
});

