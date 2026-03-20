import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MapPin, Clock } from "lucide-react-native";

export default function MyClinics({ clinics }: { clinics: any[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <MapPin color="#10b981" size={22} />
        </View>
        <Text style={styles.title}>Nearby Facilities</Text>
      </View>

      {clinics.map((clinic, i) => (
        <TouchableOpacity
          key={clinic.id}
          style={[styles.clinicCard, selected === clinic.id && styles.clinicCardActive]}
          onPress={() => setSelected(clinic.id)}
        >
          <View style={styles.clinicTop}>
            <Text style={[styles.clinicName, selected === clinic.id && styles.clinicNameActive]}>
              {clinic.name}
            </Text>
            <View style={[styles.distanceBadge, selected === clinic.id && styles.distanceBadgeActive]}>
              <Text style={[styles.distanceText, selected === clinic.id && styles.distanceTextActive]}>
                {(clinic.distance || 3.1).toFixed(1)} km
              </Text>
            </View>
          </View>

          <View style={styles.clinicStats}>
            <View style={[styles.statBox, selected === clinic.id && styles.statBoxSelected]}>
              <Text style={styles.statLabelNeutral}>QUEUE</Text>
              <Text style={styles.statValueWhite}>{clinic.currentQueue || 0}</Text>
            </View>
            <View style={[styles.statBoxRed]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Clock color="#f87171" size={10} />
                <Text style={styles.statLabelRed}>WAIT</Text>
              </View>
              <Text style={styles.statValueRed}>{clinic.estimatedWait || 0}m</Text>
            </View>
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
    borderRadius: 20, padding: 20, marginBottom: 16,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  iconBox: { padding: 8, backgroundColor: "rgba(16,185,129,0.1)", borderRadius: 10 },
  title: { fontSize: 20, fontWeight: "800", color: "#fff" },
  clinicCard: {
    padding: 14, borderRadius: 16, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(0,0,0,0.3)",
    marginBottom: 10,
  },
  clinicCardActive: {
    borderColor: "rgba(16,185,129,0.5)", backgroundColor: "rgba(16,185,129,0.1)",
  },
  clinicTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  clinicName: { fontSize: 15, fontWeight: "700", color: "#d1d5db", flex: 1 },
  clinicNameActive: { color: "#fff" },
  distanceBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  distanceBadgeActive: { backgroundColor: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.4)" },
  distanceText: { fontSize: 10, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" },
  distanceTextActive: { color: "#10b981" },
  clinicStats: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1, padding: 10, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  statBoxSelected: { backgroundColor: "rgba(0,0,0,0.4)" },
  statBoxRed: {
    flex: 1, padding: 10, borderRadius: 10,
    backgroundColor: "rgba(239,68,68,0.07)",
  },
  statLabelNeutral: { color: "#9ca3af", fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  statLabelRed: { color: "#f87171", fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  statValueWhite: { fontSize: 20, fontWeight: "800", color: "#fff" },
  statValueRed: { fontSize: 20, fontWeight: "800", color: "#ef4444", marginTop: 4 },
});
