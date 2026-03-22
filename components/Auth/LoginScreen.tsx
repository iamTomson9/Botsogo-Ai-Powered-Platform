import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { AiHcpLogo } from "../Startup/AiHcpLogo";
import { Mail, Lock, User, CheckCircle2 } from "lucide-react-native";

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const { mode } = useLocalSearchParams();
  
  const [isLogin, setIsLogin] = useState(mode === 'login' || !mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles: Array<{ label: string; value: "patient" | "doctor" | "admin" }> = [
    { label: "Patient", value: "patient" },
    { label: "Doctor", value: "doctor" },
    { label: "Admin", value: "admin" },
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

    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Top Logo Section */}
          <View style={styles.logoSection}>
            <AiHcpLogo size={80} color="#5BAFB8" />
            <Text style={styles.brandName}>AI-HCP</Text>
          </View>

          {/* Titles */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{isLogin ? "Welcome back" : "Create Account"}</Text>
            <Text style={styles.subtitle}>
              {isLogin 
                ? "Sign in to continue your journey to better health." 
                : "Join AI-HCP today for smarter health insights."}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!isLogin && (
              <>
                <View style={styles.inputWrapper}>
                  <User color="#828282" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#828282"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.roleContainer}>
                  {roles.map((r) => (
                    <TouchableOpacity
                      key={r.value}
                      style={[styles.roleChip, role === r.value && styles.roleChipActive]}
                      onPress={() => setRole(r.value)}
                    >
                      {role === r.value && <CheckCircle2 size={14} color="#fff" style={{ marginRight: 4 }} />}
                      <Text style={[styles.roleChipText, role === r.value && styles.roleChipTextActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.inputWrapper}>
              <Mail color="#828282" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#828282"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock color="#828282" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#828282"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnText}>{isLogin ? "Login" : "Sign Up"}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <TouchableOpacity 
            style={styles.toggle}
            onPress={() => { setIsLogin(!isLogin); setError(""); }}
          >
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text style={styles.toggleLink}>{isLogin ? "Sign Up" : "Login"}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F8F8" },
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
  logoSection: { alignItems: "center", marginBottom: 30 },
  brandName: { fontSize: 20, fontWeight: "800", color: "#5BAFB8", letterSpacing: 2, marginTop: 8 },
  titleSection: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#000", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#828282", lineHeight: 22 },
  form: { width: "100%" },
  errorBox: {
    backgroundColor: "#FEE2E2", padding: 12, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: "#FCA5A5",
  },
  errorText: { color: "#B91C1C", fontSize: 13, fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E5E7EB",
    borderRadius: 16, paddingHorizontal: 16, marginBottom: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#000", fontSize: 16, fontWeight: "500" },
  roleLabel: { fontSize: 14, fontWeight: "600", color: "#000", marginBottom: 12, marginLeft: 4 },
  roleContainer: { flexDirection: "row", gap: 10, marginBottom: 20 },
  roleChip: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#FFF",
  },
  roleChipActive: { backgroundColor: "#5BAFB8", borderColor: "#5BAFB8" },
  roleChipText: { fontSize: 13, fontWeight: "600", color: "#828282" },
  roleChipTextActive: { color: "#FFF" },
  primaryBtn: {
    backgroundColor: "#5BAFB8", borderRadius: 50, height: 56,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 10, shadowColor: "#5BAFB8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  toggle: { marginTop: 32, alignItems: "center" },
  toggleText: { fontSize: 15, color: "#828282" },
  toggleLink: { color: "#5BAFB8", fontWeight: "700" },
});

