import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../../firebase/config';
import { Colors } from '../../constants/Colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Update Auth Profile
      await updateProfile(userCredential.user, { displayName: name });

      // Create Firestore User Document for roles
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email: email.trim(),
        role,
        createdAt: new Date().toISOString(),
      });

      // App/_layout will automatically detect the user & role and route them
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-left" size={20} color="#64748b" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Botsogo AI today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'patient' && styles.roleBtnActive]}
                onPress={() => setRole('patient')}
              >
                <FontAwesome5 name="user" size={16} color={role === 'patient' ? '#fff' : '#64748b'} />
                <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'doctor' && styles.roleBtnActive]}
                onPress={() => setRole('doctor')}
              >
                <FontAwesome5 name="user-md" size={16} color={role === 'doctor' ? '#fff' : '#64748b'} />
                <Text style={[styles.roleText, role === 'doctor' && styles.roleTextActive]}>Doctor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <FontAwesome5 name="id-card" size={16} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <FontAwesome5 name="envelope" size={16} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <FontAwesome5 name="lock" size={16} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Sign In Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b' },
  form: { backgroundColor: '#fff', padding: 24, borderRadius: 24, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 
  },
  roleContainer: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 4, borderRadius: 12, marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
  roleBtnActive: { backgroundColor: Colors.light.primary },
  roleText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#64748b' },
  roleTextActive: { color: '#fff' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', 
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16 
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#334155' },
  button: { backgroundColor: Colors.light.primary, height: 50, borderRadius: 12, 
    justifyContent: 'center', alignItems: 'center', marginTop: 8 
  },
  buttonDisabled: { backgroundColor: '#cbd5e1' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748b', fontSize: 14 },
  footerLink: { color: Colors.light.primary, fontSize: 14, fontWeight: '600' }
});
