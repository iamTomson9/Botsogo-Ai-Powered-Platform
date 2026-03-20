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

export default function BookAppointment({ clinics }: { clinics: any[] }) {
  const { user } = useAuth();
  const [selectedClinicIdx, setSelectedClinicIdx] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const handleCheckIn = () => {
    if (selectedClinicIdx === null) return;
    setLoading(true);
    setTimeout(() => {
      setSuccess({
        queueNumber: Math.floor(Math.random() * 40) + 1,
        estimatedWaitTime: "45 mins",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.card}>
      <View style={styles.accentLine} />
      <Text style={styles.title}>Express Check-In</Text>

      {!success ? (
        <>
          <Text style={styles.label}>Patient Profile</Text>
          <View style={styles.readonlyInput}>
            <Text style={styles.readonlyText}>{user?.name || "Patient Member"}</Text>
          </View>

          <Text style={styles.label}>Select Facility</Text>
          {clinics.map((clinic, i) => (
            <TouchableOpacity
              key={clinic.id}
              style={[styles.clinicOption, selectedClinicIdx === i && styles.clinicOptionActive]}
              onPress={() => setSelectedClinicIdx(i)}
            >
              <Text style={[styles.clinicName, selectedClinicIdx === i && styles.clinicNameActive]}>
                {clinic.name}
              </Text>
              <Text style={styles.clinicWait}>Wait: {clinic.estimatedWait}m</Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Reason for Visit (Optional)</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Briefly describe your priority..."
            placeholderTextColor="#4b5563"
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.primaryBtn, (loading || selectedClinicIdx === null) && styles.btnDisabled]}
            onPress={handleCheckIn}
            disabled={loading || selectedClinicIdx === null}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Join Virtual Queue →</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Check-In Successful!</Text>
          <Text style={styles.successSubtitle}>
            You have been added to the secure virtual queue.
          </Text>

          <View style={styles.successStats}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Queue ID</Text>
              <Text style={styles.statValue}>#{success.queueNumber}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Est. Wait</Text>
              <Text style={styles.statValue}>{success.estimatedWaitTime}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => setSuccess(null)}>
            <Text style={styles.cancelLink}>Cancel or Switch Clinic</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, padding: 20, overflow: "hidden", marginBottom: 16,
  },
  accentLine: { position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: "#10b981" },
  title: { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 16, marginTop: 4 },
  label: { color: "#9ca3af", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 12 },
  readonlyInput: {
    backgroundColor: "rgba(0,0,0,0.3)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12, padding: 14,
  },
  readonlyText: { color: "#6b7280", fontSize: 15, fontWeight: "500" },
  clinicOption: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(0,0,0,0.3)", marginBottom: 8,
  },
  clinicOptionActive: { borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.1)" },
  clinicName: { color: "#d1d5db", fontWeight: "600", fontSize: 14, flex: 1 },
  clinicNameActive: { color: "#10b981" },
  clinicWait: { color: "#6b7280", fontSize: 12, fontWeight: "500" },
  textArea: {
    backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 14, color: "#fff", fontSize: 14, fontWeight: "500",
    minHeight: 80, marginBottom: 4,
  },
  primaryBtn: {
    backgroundColor: "#10b981", borderRadius: 14, padding: 16,
    alignItems: "center", marginTop: 16,
    shadowColor: "#10b981", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  successContainer: { alignItems: "center", paddingVertical: 16 },
  successIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#10b981", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#10b981", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16,
  },
  checkmark: { fontSize: 32, color: "#fff", fontWeight: "700" },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#10b981", marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: "#9ca3af", fontWeight: "500", marginBottom: 24, textAlign: "center" },
  successStats: { flexDirection: "row", gap: 16, marginBottom: 24 },
  statBox: {
    flex: 1, padding: 16, backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 16, alignItems: "center",
  },
  statLabel: { color: "#10b981", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: "800", color: "#fff" },
  cancelLink: { color: "#6b7280", fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
});
