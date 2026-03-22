import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get('window');

const KPICard = ({ title, value, trend, trendType, alert, iconName }: any) => (
  <View style={[styles.kpiCard, alert && styles.kpiCardAlert]}>
    <View style={styles.kpiTop}>
      <View
        style={[
          styles.kpiIconBox,
          { backgroundColor: alert ? "#FEF2F2" : Colors.light.primary + '15' },
        ]}
      >
        <Ionicons name={iconName} color={alert ? "#EF4444" : Colors.light.primary} size={20} />
      </View>
      {trend && (
        <View
          style={[
            styles.trendBadge,
            { backgroundColor: trendType === "down" ? Colors.light.primary + '15' : "#FEF2F2" },
          ]}
        >
          <Ionicons 
            name={trendType === "down" ? "trending-down" : "trending-up"} 
            color={trendType === "down" ? Colors.light.primary : "#EF4444"} 
            size={12} 
          />
          <Text
            style={[
              styles.trendText,
              { color: trendType === "down" ? Colors.light.primary : "#EF4444" },
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
              message: "CRITICAL: Paracetamol stock dangerously low (50 units remaining)",
            },
            {
              medicineId: "m2",
              message: "WARNING: Amoxicillin requested by 3 clinics today, monitor supply.",
            }
          ],
        },
        ai: { 
          todayCount: 34,
          successfulTriages: 28,
          healthAuditsGenerated: 12
        },
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.light.primary} size="large" />
        <Text style={styles.loadingText}>Compiling System Health Data...</Text>
      </View>
    );
  }

  const stocks = [
    { name: "Paracetamol", value: 50, max: 500, color: "#EF4444" },
    { name: "Amoxicillin", value: 400, max: 500, color: Colors.light.primary },
    { name: "Ibuprofen", value: 300, max: 500, color: Colors.light.primary },
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
      <Text style={styles.pageTitle}>System Overview</Text>

      {/* Primary KPI Grid */}
      <View style={styles.kpiGrid}>
        <KPICard
          title="Avg Wait Time"
          value={`${metrics.flow.avgWaitTime}m`}
          trend="12%"
          trendType="down"
          iconName="time-outline"
        />
        <KPICard
          title="Stock Alerts"
          value={metrics.medicine.stockouts}
          trend="+2"
          trendType="up"
          alert
          iconName="warning-outline"
        />
        <KPICard
          title="Active Patients"
          value={metrics.flow.activePatients}
          iconName="people-outline"
        />
        <KPICard
          title="AI Consults"
          value={metrics.ai.todayCount}
          iconName="pulse-outline"
        />
      </View>

      {/* AI Performance Metrics */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>AI Performance</Text>
          <Ionicons name="sparkles" color={Colors.light.primary} size={20} />
        </View>
        <View style={styles.aiMetricsRow}>
          <View style={styles.aiMetricBox}>
            <Text style={styles.aiMetricValue}>{metrics.ai.successfulTriages}</Text>
            <Text style={styles.aiMetricLabel}>Successful Triages</Text>
          </View>
          <View style={styles.aiMetricDivider} />
          <View style={styles.aiMetricBox}>
            <Text style={styles.aiMetricValue}>{metrics.ai.healthAuditsGenerated}</Text>
            <Text style={styles.aiMetricLabel}>Audits Generated</Text>
          </View>
        </View>
      </View>

      {/* Critical Operational Alerts */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Operational Alerts</Text>
          <Ionicons name="notifications-outline" color="#828282" size={20} />
        </View>
        
        {metrics.medicine.lowStockAlerts.map((alert: any, idx: number) => (
          <View key={`med-${idx}`} style={alert.message.includes('CRITICAL') ? styles.alertRowRed : styles.alertRowOrange}>
            <Ionicons name="medical-outline" color={alert.message.includes('CRITICAL') ? "#EF4444" : "#F59E0B"} size={20} />
            <Text style={alert.message.includes('CRITICAL') ? styles.alertTextRed : styles.alertTextOrange}>{alert.message}</Text>
          </View>
        ))}
        
        {metrics.flow.congestionAlerts.map((alert: any, idx: number) => (
          <View key={`flow-${idx}`} style={styles.alertRowRed}>
            <Ionicons name="business-outline" color="#EF4444" size={20} />
            <Text style={styles.alertTextRed}>{alert.message}</Text>
          </View>
        ))}
      </View>

      {/* Patient Flow Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Patient Flow Intensity</Text>
          <Ionicons name="information-circle-outline" color="#828282" size={20} />
        </View>
        <View style={styles.barChart}>
          {flowData.map((val, i) => (
            <View key={i} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height: (val / maxFlow) * 100,
                    backgroundColor: val > 50 ? "#F87171" : Colors.light.primary,
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 20 },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },

  loadingText: {
    color: Colors.light.primary,
    marginTop: 16,
    fontSize: 15,
    fontWeight: "600",
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 24,
    marginTop: 10,
  },

  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  kpiCard: {
    width: '48%', 
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  kpiCardAlert: { borderColor: "#FEE2E2", borderWidth: 1, backgroundColor: '#FEF2F2' },

  kpiTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  kpiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  kpiTitle: { color: "#64748b", fontSize: 13, fontWeight: "600" },

  kpiValue: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginBottom: 4 },

  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },

  trendText: { fontSize: 12, fontWeight: "700" },

  chartCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  aiMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  
  aiMetricBox: {
    alignItems: 'center',
  },
  
  aiMetricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  
  aiMetricLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  
  aiMetricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },

  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 140,
    gap: 12,
  },

  barColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end" },

  bar: { width: "100%", borderRadius: 8, minHeight: 8 },

  barLabel: { color: "#64748b", fontSize: 11, fontWeight: "600", marginTop: 12 },

  stockRow: { marginBottom: 20 },

  stockInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  stockName: { color: "#1e293b", fontSize: 15, fontWeight: "600" },

  stockBarBg: {
    height: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 100,
    overflow: "hidden",
  },

  stockBarFill: { height: "100%", borderRadius: 100 },

  stockCount: { fontSize: 14, fontWeight: "700" },

  alertRowOrange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    borderRadius: 16,
    marginBottom: 12,
  },

  alertTextOrange: {
    color: "#D97706",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    lineHeight: 22,
  },

  alertRowRed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 16,
    marginBottom: 12,
  },

  alertTextRed: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    lineHeight: 22,
  },
});
