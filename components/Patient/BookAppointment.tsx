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
import { Hospital, Clock, ArrowRight, CheckCircle2, XCircle } from "lucide-react-native";

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
      <Text style={styles.title}>Express Check-In</Text>

      {!success ? (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Patient Profile</Text>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>{user?.name || "Patient Member"}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Select Facility</Text>
            {clinics.map((clinic, i) => (
              <TouchableOpacity
                key={clinic.id}
                style={[styles.clinicOption, selectedClinicIdx === i && styles.clinicOptionActive]}
                onPress={() => setSelectedClinicIdx(i)}
              >
                <View style={styles.clinicHeader}>
                  <Hospital color={selectedClinicIdx === i ? "#5BAFB8" : "#828282"} size={18} />
                  <Text style={[styles.clinicName, selectedClinicIdx === i && styles.clinicNameActive]}>
                    {clinic.name}
                  </Text>
                </View>
                <View style={styles.clinicInfo}>
                  <Clock color="#828282" size={12} />
                  <Text style={styles.clinicWait}>{clinic.estimatedWait}m wait</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Reason for Visit (Optional)</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={3}
              placeholder="e.g. Follow-up consultation, persistent fever..."
              placeholderTextColor="#828282"
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, (loading || selectedClinicIdx === null) && styles.btnDisabled]}
            onPress={handleCheckIn}
            disabled={loading || selectedClinicIdx === null}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Join Virtual Queue</Text>
                <ArrowRight color="#fff" size={20} />
              </>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
             <CheckCircle2 color="#fff" size={40} />
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

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setSuccess(null)}>
            <XCircle color="#828282" size={16} />
            <Text style={styles.cancelText}>Cancel Check-In</Text>
          </TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: "800", color: "#000", marginBottom: 20 },
  section: { marginBottom: 16 },
  label: { color: "#000", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 2 },
  readonlyInput: {
    backgroundColor: "#F3F4F6", borderRadius: 12, padding: 14,
  },
  readonlyText: { color: "#828282", fontSize: 15, fontWeight: "500" },
  clinicOption: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB",
    backgroundColor: "#FFF", marginBottom: 10,
  },
  clinicOptionActive: { borderColor: "#5BAFB8", backgroundColor: "#F0F9FA" },
  clinicHeader: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  clinicName: { color: "#000", fontWeight: "600", fontSize: 14 },
  clinicNameActive: { color: "#5BAFB8" },
  clinicInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  clinicWait: { color: "#828282", fontSize: 12, fontWeight: "500" },
  textArea: {
    backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 16, padding: 16, color: "#000", fontSize: 15, fontWeight: "500",
    minHeight: 100,
  },
  primaryBtn: {
    backgroundColor: "#5BAFB8", borderRadius: 50, height: 56,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 10, shadowColor: "#5BAFB8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  successContainer: { alignItems: "center", paddingVertical: 10 },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#5BAFB8", alignItems: "center", justifyContent: "center",
    marginBottom: 20,
  },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#000", marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: "#828282", fontWeight: "500", marginBottom: 28, textAlign: "center", lineHeight: 20 },
  successStats: { flexDirection: "row", gap: 14, marginBottom: 30 },
  statBox: {
    flex: 1, padding: 16, backgroundColor: "#F9FAFB",
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 20, alignItems: "center",
  },
  statLabel: { color: "#5BAFB8", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: "800", color: "#000" },
  cancelBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  cancelText: { color: "#828282", fontSize: 14, fontWeight: "600" },
});

