import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { Activity, ShieldCheck, Clock } from "lucide-react-native";

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles: Array<{ label: string; value: "patient" | "doctor" | "admin" }> = [
    { label: "Patient / Customer", value: "patient" },
    { label: "Medical Staff (Doctor)", value: "doctor" },
    { label: "System Administrator", value: "admin" },
  ];

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, role);
      }
      router.replace("/");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Activity color="#fff" size={28} />
          </View>
          <Text style={styles.logoText}>Botsogo.</Text>
        </View>

        {/* Feature highlights */}
        <View style={styles.highlights}>
          <View style={styles.highlightRow}>
            <View style={styles.highlightIcon}>
              <Clock color="#10b981" size={16} />
            </View>
            <Text style={styles.highlightText}>Smart virtual queues reduce wait times by 40%.</Text>
          </View>
          <View style={styles.highlightRow}>
            <View style={styles.highlightIcon}>
              <ShieldCheck color="#10b981" size={16} />
            </View>
            <Text style={styles.highlightText}>Secure, intelligent & scalable infrastructure.</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <Text style={styles.cardTitle}>
            {isLogin ? "Welcome back" : "Create an account"}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isLogin
              ? "Enter your credentials to securely access your portal."
              : "Sign up below to join the Botsogo network."}
          </Text>

          {!!error && (
            <View style={styles.errorBox}>
              <ShieldCheck color="#f87171" size={16} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!isLogin && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor="#4b5563"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Account Role</Text>
              <View style={styles.roleRow}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
                    onPress={() => setRole(r.value)}
                  >
                    <Text style={[styles.roleBtnText, role === r.value && styles.roleBtnTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@company.com"
            placeholderTextColor="#4b5563"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Secure Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#4b5563"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isLogin ? "Sign In Securely" : "Create Account →"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(""); }}>
          <Text style={styles.switchText}>
            {isLogin ? "New to Botsogo? " : "Already have an account? "}
            <Text style={styles.switchLink}>{isLogin ? "Create an account" : "Sign in here"}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#011c16" },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32 },
  logoBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: "#10b981", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  highlights: { marginBottom: 28, gap: 12 },
  highlightRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  highlightIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center", justifyContent: "center",
  },
  highlightText: { color: "#d1d5db", fontSize: 13, fontWeight: "500", flex: 1 },
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 20, padding: 24, overflow: "hidden", marginBottom: 24,
  },
  cardAccent: {
    position: "absolute", top: 0, left: 0, right: 0, height: 2,
    backgroundColor: "#10b981",
  },
  cardTitle: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 4, marginTop: 4 },
  cardSubtitle: { fontSize: 13, color: "#9ca3af", marginBottom: 20, fontWeight: "500" },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
    borderRadius: 12, padding: 12, marginBottom: 16,
  },
  errorText: { color: "#f87171", fontSize: 13, fontWeight: "600", flex: 1 },
  label: { color: "#9ca3af", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, fontWeight: "500",
  },
  roleRow: { gap: 8, marginBottom: 4 },
  roleBtn: {
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  roleBtnActive: { borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.15)" },
  roleBtnText: { color: "#9ca3af", fontWeight: "600", fontSize: 14 },
  roleBtnTextActive: { color: "#10b981" },
  primaryBtn: {
    backgroundColor: "#10b981", borderRadius: 14, padding: 16,
    alignItems: "center", marginTop: 20,
    shadowColor: "#10b981", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },
  switchText: { textAlign: "center", color: "#9ca3af", fontSize: 14, fontWeight: "500" },
  switchLink: { color: "#10b981", fontWeight: "700" },
});
