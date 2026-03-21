import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
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
        model: 'gemini-2.5-flash',
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
              <FontAwesome5 name="redo" size={14} color={Colors.light.secondary} />
              <Text style={styles.resetText}>Choose Different Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadBox}>
            <FontAwesome5 name="x-ray" size={48} color="#94a3b8" />
            <Text style={styles.uploadTitle}>Upload Medical Image</Text>
            <Text style={styles.uploadSub}>Skin conditions, wounds, x-rays, or visible symptoms</Text>
            <View style={styles.uploadBtns}>
              <TouchableOpacity style={styles.uploadBtn} onPress={takePhoto}>
                <FontAwesome5 name="camera" size={18} color="#fff" />
                <Text style={styles.uploadBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: '#475569' }]} onPress={pickImage}>
                <FontAwesome5 name="images" size={18} color="#fff" />
                <Text style={styles.uploadBtnText}>Gallery</Text>
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
              <FontAwesome5 name="robot" size={18} color={Colors.light.secondary} />
              <Text style={styles.analysisTitle}>AI Clinical Analysis</Text>
            </View>
            <Text style={styles.analysisText}>{analysis}</Text>
            <View style={styles.disclaimer}>
              <FontAwesome5 name="exclamation-triangle" size={12} color="#f59e0b" />
              <Text style={styles.disclaimerText}>
                This is AI-assisted analysis for physician review only. Clinical judgment must prevail.
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
  content: { padding: 20, gap: 16 },
  uploadBox: {
    borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed',
    borderRadius: 20, padding: 36, alignItems: 'center', gap: 10, backgroundColor: '#fff',
  },
  uploadTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
  uploadSub: { fontSize: 13, color: '#64748b', textAlign: 'center' },
  uploadBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.light.secondary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  preview: { width: '100%', height: 280, borderRadius: 20, marginBottom: 8 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', padding: 10 },
  resetText: { color: Colors.light.secondary, fontWeight: '600' },
  loadingBox: { alignItems: 'center', padding: 32, gap: 12 },
  loadingText: { color: '#64748b', fontSize: 15 },
  analysisBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  analysisTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.secondary },
  analysisText: { fontSize: 15, color: '#334155', lineHeight: 26 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 16, padding: 12, backgroundColor: '#fef9c3', borderRadius: 10 },
  disclaimerText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
});
