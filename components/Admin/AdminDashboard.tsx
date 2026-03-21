import {
  Activity,
  AlertTriangle,
  Clock,
  Info,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const KPICard = ({ title, value, trend, trendType, alert, Icon }: any) => (
  <View style={[styles.kpiCard, alert && styles.kpiCardAlert]}>
    <View style={styles.kpiTop}>
      <View
        style={[
          styles.kpiIconBox,
          { backgroundColor: alert ? "#FEF2F2" : "#F0F9FA" },
        ]}
      >
        <Icon color={alert ? "#EF4444" : "#5BAFB8"} size={20} />
      </View>
      {trend && (
        <View
          style={[
            styles.trendBadge,
            { backgroundColor: trendType === "down" ? "#F0F9FA" : "#FEF2F2" },
          ]}
        >
          {trendType === "down" ? (
            <TrendingDown color="#5BAFB8" size={12} />
          ) : (
            <TrendingUp color="#EF4444" size={12} />
          )}
          <Text
            style={[
              styles.trendText,
              { color: trendType === "down" ? "#5BAFB8" : "#EF4444" },
            ]}
          >
            {trend}
          </Text>
        </View>
      )}
    </View>
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiTitle}>{title}</Text>
  </View>
);

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMetrics({
        flow: {
          avgWaitTime: 45,
          activePatients: 120,
          congestionAlerts: [
            {
              clinicId: "c1",
              message: "Gaborone Main Clinic is congested (>60 min wait)",
            },
          ],
        },
        medicine: {
          stockouts: 2,
          lowStockAlerts: [
            {
              medicineId: "m1",
              message: "Paracetamol running low - only 50 units left",
            },
          ],
        },
        ai: { todayCount: 34 },
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#5BAFB8" size="large" />
        <Text style={styles.loadingText}>Analyzing Health Data...</Text>
      </View>
    );
  }

  const stocks = [
    { name: "Paracetamol", value: 50, max: 500, color: "#EF4444" },
    { name: "Amoxicillin", value: 400, max: 500, color: "#5BAFB8" },
    { name: "Ibuprofen", value: 300, max: 500, color: "#5BAFB8" },
    { name: "Metformin", value: 100, max: 500, color: "#F59E0B" },
  ];

  const flowHours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
  const flowData = [15, 45, 60, 30, 50, 20];
  const maxFlow = Math.max(...flowData);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.pageTitle}>System Health</Text>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        <KPICard
          title="Avg Wait Time"
          value={`${metrics.flow.avgWaitTime}m`}
          trend="12%"
          trendType="down"
          Icon={Clock}
        />
        <KPICard
          title="Total Stockouts"
          value={metrics.medicine.stockouts}
          trend="+2"
          trendType="up"
          alert
          Icon={AlertTriangle}
        />
        <KPICard
          title="Active Patients"
          value={metrics.flow.activePatients}
          Icon={Users}
        />
        <KPICard
          title="AI Consults"
          value={metrics.ai.todayCount}
          Icon={Activity}
        />
      </View>

      {/* Patient Flow Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Patient Flow Intensity</Text>
          <Info color="#828282" size={16} />
        </View>
        <View style={styles.barChart}>
          {flowData.map((val, i) => (
            <View key={i} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height: (val / maxFlow) * 100,
                    backgroundColor: val > 50 ? "#F87171" : "#5BAFB8",
                  },
                ]}
              />
              <Text style={styles.barLabel}>{flowHours[i]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Medicine Inventory */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Essential Medication Stock</Text>
        {stocks.map((item, i) => (
          <View key={i} style={styles.stockRow}>
            <View style={styles.stockInfo}>
              <Text style={styles.stockName}>{item.name}</Text>
              <Text style={[styles.stockCount, { color: item.color }]}>
                {item.value} units
              </Text>
            </View>
            <View style={styles.stockBarBg}>
              <View
                style={[
                  styles.stockBarFill,
                  {
                    width: `${(item.value / item.max) * 100}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Critical Alerts Area */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Operational Alerts</Text>
        {metrics.medicine.lowStockAlerts.map((alert: any) => (
          <View key={alert.medicineId} style={styles.alertRowOrange}>
            <AlertTriangle color="#F59E0B" size={18} />
            <Text style={styles.alertTextOrange}>{alert.message}</Text>
          </View>
        ))}
        {metrics.flow.congestionAlerts.map((alert: any) => (
          <View key={alert.clinicId} style={styles.alertRowRed}>
            <Activity color="#EF4444" size={18} />
            <Text style={styles.alertTextRed}>{alert.message}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },

  loadingText: {
    color: "#5BAFB8",
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    marginBottom: 20,
  },

  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 20,
  },

  kpiCard: {
    width: "47%",
    margin: "1.5%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  kpiCardAlert: { borderColor: "#FEE2E2", borderWidth: 1 },

  kpiTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  kpiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  kpiTitle: { color: "#828282", fontSize: 13, fontWeight: "600" },

  kpiValue: { fontSize: 24, fontWeight: "800", color: "#000", marginBottom: 2 },

  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
  },

  trendText: { fontSize: 11, fontWeight: "700" },

  chartCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    marginBottom: 20,
  },

  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    gap: 10,
  },

  barColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end" },

  bar: { width: "100%", borderRadius: 6, minHeight: 6 },

  barLabel: { color: "#828282", fontSize: 10, fontWeight: "600", marginTop: 8 },

  stockRow: { marginBottom: 16 },

  stockInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  stockName: { color: "#000", fontSize: 14, fontWeight: "600" },

  stockBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 100,
    overflow: "hidden",
  },

  stockBarFill: { height: "100%", borderRadius: 100 },

  stockCount: { fontSize: 13, fontWeight: "700" },

  alertRowOrange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    borderRadius: 16,
    marginBottom: 10,
  },

  alertTextOrange: {
    color: "#D97706",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },

  alertRowRed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 16,
    marginBottom: 10,
  },

  alertTextRed: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },
});
