import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MapPin, Clock, Users, Navigation } from "lucide-react-native";

export default function MyClinics({ clinics }: { clinics: any[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <MapPin color="#5BAFB8" size={22} />
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
            <View style={styles.nameSection}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              <View style={styles.locationInfo}>
                <Navigation color="#828282" size={12} />
                <Text style={styles.distanceText}>{(clinic.distance || 3.1).toFixed(1)} km away</Text>
              </View>
            </View>
            <View style={styles.distanceBadge}>
               <Text style={styles.badgeText}>Open</Text>
            </View>
          </View>

          <View style={styles.clinicStats}>
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Users color="#5BAFB8" size={12} />
                <Text style={styles.statLabel}>QUEUE</Text>
              </View>
              <Text style={styles.statValue}>{clinic.currentQueue || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Clock color="#F87171" size={12} />
                <Text style={[styles.statLabel, { color: "#F87171" }]}>WAIT</Text>
              </View>
              <Text style={styles.statValue}>{clinic.estimatedWait || 0}m</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
  clinicCard: {
    padding: 18, borderRadius: 20, borderWidth: 1,
    borderColor: "#E5E7EB", backgroundColor: "#FFF",
    marginBottom: 12,
  },
  clinicCardActive: {
    borderColor: "#5BAFB8", backgroundColor: "#F0F9FA",
  },
  clinicTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  nameSection: { flex: 1 },
  clinicName: { fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 4 },
  locationInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  distanceText: { fontSize: 13, color: "#828282", fontWeight: "500" },
  distanceBadge: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
    backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0",
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#059669", textTransform: "uppercase" },
  clinicStats: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1, padding: 12, borderRadius: 16,
    backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB",
  },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  statLabel: { color: "#5BAFB8", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  statValue: { fontSize: 20, fontWeight: "800", color: "#000" },
});

