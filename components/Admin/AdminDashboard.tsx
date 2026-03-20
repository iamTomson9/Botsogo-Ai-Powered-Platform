import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { AlertTriangle, Clock, Users, Activity } from "lucide-react-native";

const KPICard = ({ title, value, trend, alert, Icon }: any) => (
  <View style={[styles.kpiCard, alert && styles.kpiCardAlert]}>
    <View style={styles.kpiTop}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <View style={[styles.kpiIconBox, { backgroundColor: alert ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)" }]}>
        <Icon color={alert ? "#f87171" : "#10b981"} size={18} />
      </View>
    </View>
    <Text style={styles.kpiValue}>{value}</Text>
    {trend && (
      <View style={styles.kpiTrendRow}>
        <View style={[styles.trendBadge, { backgroundColor: alert ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)" }]}>
          <Text style={[styles.trendText, { color: alert ? "#f87171" : "#10b981" }]}>{trend}</Text>
        </View>
        <Text style={styles.trendSuffix}>vs last week</Text>
      </View>
    )}
  </View>
);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMetrics({
        flow: { avgWaitTime: 45, activePatients: 120, congestionAlerts: [{ clinicId: "c1", message: "Gaborone Main Clinic is congested (>60 min wait)" }] },
        medicine: { stockouts: 2, lowStockAlerts: [{ medicineId: "m1", message: "Paracetamol running low - only 50 units left" }] },
        ai: { todayCount: 34 },
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#10b981" size="large" />
        <Text style={styles.loadingText}>Analyzing Data...</Text>
      </View>
    );
  }

  // Simple bar chart replacement using native Views (no chart.js dependency)
  const stocks = [
    { name: "Paracetamol", value: 50, max: 500, color: "#ef4444" },
    { name: "Amoxicillin", value: 400, max: 500, color: "#10b981" },
    { name: "Ibuprofen", value: 300, max: 500, color: "#10b981" },
    { name: "Metformin", value: 100, max: 500, color: "#f59e0b" },
  ];

  const flowHours = ['8am', '10am', '12pm', '2pm', '4pm', '6pm'];
  const flowData = [15, 45, 60, 30, 50, 20];
  const maxFlow = Math.max(...flowData);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>System Overview</Text>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <KPICard title="Avg Wait" value={`${metrics.flow.avgWaitTime}m`} trend="↓ 12%" Icon={Clock} />
        <KPICard title="Stockouts" value={metrics.medicine.stockouts} trend="↑ 2" alert Icon={AlertTriangle} />
        <KPICard title="Active Patients" value={metrics.flow.activePatients} Icon={Users} />
        <KPICard title="AI Interactions" value={metrics.ai.todayCount} Icon={Activity} />
      </View>

      {/* Patient Flow Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Patient Flow Trend</Text>
        <View style={styles.barChart}>
          {flowData.map((val, i) => (
            <View key={i} style={styles.barColumn}>
              <View style={[styles.bar, { height: (val / maxFlow) * 100, backgroundColor: "#10b981" }]} />
              <Text style={styles.barLabel}>{flowHours[i]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Medicine Stock */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Medicine Stock Status</Text>
        {stocks.map((item, i) => (
          <View key={i} style={styles.stockRow}>
            <Text style={styles.stockName}>{item.name}</Text>
            <View style={styles.stockBarBg}>
              <View style={[styles.stockBarFill, { width: `${(item.value / item.max) * 100}%`, backgroundColor: item.color }]} />
            </View>
            <Text style={[styles.stockCount, { color: item.color }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Alerts */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>System Alerts</Text>
        {metrics.medicine.lowStockAlerts.map((alert: any) => (
          <View key={alert.medicineId} style={styles.alertRowOrange}>
            <AlertTriangle color="#f97316" size={18} />
            <Text style={styles.alertTextOrange}>{alert.message}</Text>
          </View>
        ))}
        {metrics.flow.congestionAlerts.map((alert: any) => (
          <View key={alert.clinicId} style={styles.alertRowRed}>
            <Activity color="#f87171" size={18} />
            <Text style={styles.alertTextRed}>{alert.message}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#011c16" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#011c16" },
  loadingText: { color: "#10b981", marginTop: 12, fontSize: 15, fontWeight: "600" },
  pageTitle: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 16 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  kpiCard: {
    flex: 1, minWidth: "45%", backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 16,
  },
  kpiCardAlert: { borderColor: "rgba(239,68,68,0.4)" },
  kpiTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  kpiTitle: { color: "#9ca3af", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  kpiIconBox: { padding: 6, borderRadius: 8 },
  kpiValue: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 6 },
  kpiTrendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  trendBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  trendText: { fontSize: 11, fontWeight: "700" },
  trendSuffix: { color: "#6b7280", fontSize: 10, fontWeight: "500" },
  chartCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, padding: 16, marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 16 },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 110, gap: 8 },
  barColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4, minHeight: 4 },
  barLabel: { color: "#6b7280", fontSize: 9, fontWeight: "600", marginTop: 4 },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  stockName: { color: "#d1d5db", fontSize: 12, fontWeight: "600", width: 90 },
  stockBarBg: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" },
  stockBarFill: { height: "100%", borderRadius: 100 },
  stockCount: { fontSize: 12, fontWeight: "700", width: 36, textAlign: "right" },
  alertRowOrange: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 12,
    backgroundColor: "rgba(249,115,22,0.1)", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)",
    borderRadius: 12, marginBottom: 8,
  },
  alertTextOrange: { color: "#fb923c", fontSize: 13, fontWeight: "500", flex: 1 },
  alertRowRed: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 12,
    backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 12, marginBottom: 8,
  },
  alertTextRed: { color: "#f87171", fontSize: 13, fontWeight: "500", flex: 1 },
});
