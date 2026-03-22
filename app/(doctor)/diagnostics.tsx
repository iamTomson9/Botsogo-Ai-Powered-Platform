import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import * as FileSystem from 'expo-file-system';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are a clinical AI assistant helping licensed medical professionals analyze dermatological and visible medical conditions from images.

Your job is to:
1. Describe what you see in the image objectively.
2. List potential diagnoses (most likely first) with confidence levels.
3. Identify key visual indicators that support each diagnosis.
4. Recommend immediate next steps (additional tests, specialist referrals, treatments).
5. Flag any urgent conditions that require immediate attention.

Always use clinical language appropriate for a doctor. Add a disclaimer that this is AI-assisted analysis for physician review, not a replacement for clinical judgment.`;

export default function Diagnostics() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setAnalysis(null);
      analyzeImage(result.assets[0].base64!);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setAnalysis(null);
      analyzeImage(result.assets[0].base64!);
    }
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    try {
      const payload = {
        model: 'gemini-1.5-flash',
        messages: [
          { role: 'user', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64}` }
              },
              {
                type: 'text',
                text: 'Please analyze this medical image and provide a detailed clinical assessment.'
              }
            ]
          }
        ]
      };

      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GEMINI_API_KEY}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        setAnalysis(data.choices[0].message.content);
      } else {
        setAnalysis('Analysis failed. Please try again with a clearer image.');
      }
    } catch (e) {
      console.error(e);
      setAnalysis('An error occurred contacting the AI. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Diagnostics</Text>
        <Text style={styles.subtitle}>Upload images for AI-powered analysis</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Image area */}
        {image ? (
          <View>
            <Image source={{ uri: image }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setImage(null); setAnalysis(null); }}>
              <Ionicons name="reload" size={16} color={Colors.light.secondary} />
              <Text style={styles.resetText}>Analyze Another Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadBox}>
            <View style={styles.uploadIconCircle}>
               <Ionicons name="scan" size={48} color={Colors.light.secondary} />
            </View>
            <Text style={styles.uploadTitle}>Clinical Image Capture</Text>
            <Text style={styles.uploadSub}>Securely upload dermoscopy, x-rays, or visible pathologies for AI-assisted diagnostic insights.</Text>
            <View style={styles.uploadBtns}>
              <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.uploadBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: '#475569' }]} onPress={pickImage}>
                <Ionicons name="images" size={20} color="#fff" />
                <Text style={styles.uploadBtnText}>Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* AI Analysis */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.light.secondary} />
            <Text style={styles.loadingText}>AI analyzing image...</Text>
          </View>
        )}

        {analysis && !loading && (
          <View style={styles.analysisBox}>
            <View style={styles.analysisHeader}>
              <View style={styles.aiBadge}>
                 <Ionicons name="sparkles" size={14} color={Colors.light.secondary} />
                 <Text style={styles.aiBadgeText}>AI INSIGHTS</Text>
              </View>
              <Text style={styles.analysisTitle}>Diagnostic Report</Text>
            </View>
            <Text style={styles.analysisText}>{analysis}</Text>
            <View style={styles.disclaimer}>
              <Ionicons name="alert-circle" size={16} color="#92400e" />
              <Text style={styles.disclaimerText}>
                This report is for clinical reference only. AI analysis must be validated by the attending physician before definitive care.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, backgroundColor: Colors.light.secondary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#ccfbf1', marginTop: 4 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  uploadBox: {
    borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed',
    borderRadius: 24, padding: 32, alignItems: 'center', backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
  },
  uploadIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.light.secondary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  uploadSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 10 },
  uploadBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.light.secondary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24 },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  preview: { width: '100%', height: 320, borderRadius: 24, marginBottom: 12 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 12 },
  resetText: { color: Colors.light.secondary, fontWeight: '700', fontSize: 14 },
  loadingBox: { alignItems: 'center', padding: 40, gap: 16 },
  loadingText: { color: '#64748b', fontSize: 16, fontWeight: '500' },
  analysisBox: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 15, elevation: 4 },
  analysisHeader: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.light.secondary + '10', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 12 },
  aiBadgeText: { fontSize: 10, fontWeight: '900', color: Colors.light.secondary, letterSpacing: 0.5 },
  analysisTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  analysisText: { fontSize: 15, color: '#334155', lineHeight: 28 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 24, padding: 16, backgroundColor: '#fff7ed', borderRadius: 14, borderWidth: 1, borderColor: '#ffedd5' },
  disclaimerText: { flex: 1, fontSize: 12, color: '#9a3412', lineHeight: 20, fontWeight: '500' },
});
