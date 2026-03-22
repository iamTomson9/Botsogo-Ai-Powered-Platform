import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../../constants/Colors';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export default function Transcription() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Microphone access is needed to record consultations.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setDuration(0);
      setTranscript(null);
      setSummary(null);

      intervalRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (e) {
      Alert.alert('Error', 'Could not start recording. Please try again.');
      console.error(e);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    clearInterval(intervalRef.current!);
    setIsRecording(false);
    setTranscribing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) throw new Error('No audio file saved.');

      const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

      const payload = {
        model: 'gemini-1.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'input_audio',
                input_audio: { data: base64Audio, format: 'wav' }
              },
              {
                type: 'text',
                text: `You are a medical scribe AI. Please:
1. Transcribe the audio recording verbatim.
2. Then generate a structured clinical consultation note from the transcript including:
   - Chief Complaint
   - History of Presenting Illness (HPI)
   - Key Findings / Observations
   - Assessment / Impression
   - Plan

Format the output clearly with section headers.`
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
        const content = data.choices[0].message.content as string;

        const splitIndex = content.indexOf('Chief Complaint');
        if (splitIndex !== -1) {
          setTranscript(content.substring(0, splitIndex).trim());
          setSummary(content.substring(splitIndex).trim());
        } else {
          setTranscript(content);
        }
      } else {
        setTranscript('Transcription failed. Please try recording again in a quieter environment.');
      }
    } catch (e) {
      console.error(e);
      setTranscript('An error occurred during transcription. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Consultation Transcriber</Text>
        <Text style={styles.subtitle}>Record and auto-transcribe patient consultations</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Recording Card */}
        <View style={styles.recordingCard}>
          {isRecording && (
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>RECORDING</Text>
              <Text style={styles.timerText}>{formatTime(duration)}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={transcribing}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.recordLabel}>
            {transcribing ? 'Transcribing...' : isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
          </Text>
        </View>

        {transcribing && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.light.secondary} />
            <Text style={styles.loadingText}>AI is transcribing and generating clinical notes...</Text>
          </View>
        )}

        {/* Transcript */}
        {transcript && !transcribing && (
          <View style={styles.resultBox}>
            <View style={styles.resultHeader}>
              <Ionicons name="document-text-outline" size={18} color={Colors.light.secondary} />
              <Text style={styles.resultTitle}>Voice Transcription</Text>
            </View>
            <Text style={styles.resultText}>{transcript}</Text>
          </View>
        )}

        {/* Clinical Summary */}
        {summary && !transcribing && (
          <View style={[styles.resultBox, { borderColor: '#10b981', borderLeftWidth: 6 }]}>
            <View style={styles.resultHeader}>
              <Ionicons name="medical-outline" size={18} color="#10b981" />
              <Text style={[styles.resultTitle, { color: '#10b981' }]}>Structured Clinical Note</Text>
            </View>
            <Text style={styles.resultText}>{summary}</Text>
            <View style={styles.disclaimer}>
              <Ionicons name="shield-checkmark" size={14} color="#065f46" />
              <Text style={styles.disclaimerText}>AI-assisted documentation. Please verify facts before finalizing the medical record.</Text>
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
  recordingCard: { backgroundColor: '#fff', borderRadius: 28, padding: 32, alignItems: 'center', gap: 20, shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 15, elevation: 5 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveText: { fontSize: 12, fontWeight: '900', color: '#ef4444', letterSpacing: 1 },
  timerText: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  recordBtn: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.light.secondary, justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.light.secondary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  recordBtnActive: { backgroundColor: '#ef4444', shadowColor: '#ef4444' },
  recordLabel: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  loadingBox: { alignItems: 'center', padding: 40, gap: 16 },
  loadingText: { color: '#64748b', fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
  resultBox: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#0f172a', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  resultTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.secondary },
  resultText: { fontSize: 15, color: '#334155', lineHeight: 28, fontWeight: '400' },
  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, padding: 14, backgroundColor: '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: '#dcfce7' },
  disclaimerText: { flex: 1, fontSize: 12, color: '#065f46', lineHeight: 18, fontWeight: '600' },
});
