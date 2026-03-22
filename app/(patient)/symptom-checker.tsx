import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { sendChatRequest, handleToolCalls, Message } from '../../services/aiService';

const SEVERITY_COLORS: Record<string, string> = {
  low: '#10b981',
  moderate: '#f59e0b',
  high: '#ef4444',
  critical: '#b91c1c',
  clinical: '#6d28d9',
};

const TriageCard = ({ report, onDone }: { report: any, onDone: () => void }) => {
  const severityColor = SEVERITY_COLORS[report.severity] || Colors.light.primary;
  
  return (
    <View style={styles.triageCard}>
      <View style={[styles.successCircle, { backgroundColor: severityColor }]}>
        <Ionicons name="checkmark" size={32} color="#fff" />
      </View>
      <Text style={styles.triageTitle}>Booking Confirmed</Text>
      
      <View style={[styles.severityBadge, { backgroundColor: severityColor + '15' }]}>
        <Text style={[styles.severityText, { color: severityColor }]}>
          {report.triageCategory?.toUpperCase() || report.severity?.toUpperCase()}
        </Text>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Clinical Summary for Doctor:</Text>
        <Text style={styles.summaryText}>{report.patientSummary}</Text>
      </View>

      <Text style={styles.triageInfo}>
        Routed to <Text style={{ fontWeight: 'bold' }}>{report.hospitalName || "General Hospital"}</Text>. 
        {report.distance && (
            <Text style={{ color: Colors.light.primary }}>
               {"\n"}📍 {report.distance.toFixed(1)} km away
            </Text>
        )}
        {report.eta && (
            <Text style={{ fontWeight: '600' }}>
               {" • "}🕒 ETA: {report.eta} mins
            </Text>
        )}
      </Text>

      <TouchableOpacity style={[styles.queueBtn, { backgroundColor: Colors.light.primary }]} onPress={onDone}>
        <Text style={styles.queueBtnText}>Enter Digital Queue</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
};

export default function ChatSymptomChecker() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: `Hello ${user.displayName || 'there'}! I am Botsogo AI. I see your next appointment is unscheduled. How are you feeling today?` }
      ]);
    }
  }, [user]);

  useEffect(() => {
    const getPermissions = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.warn("Location permission denied");
            return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });
    };
    getPermissions();
  }, []);

  useEffect(() => {

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { role: 'user', content: input.trim() };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const userContext = user ? { 
          uid: user.uid, 
          name: user.displayName || 'Patient',
          dob: user.dob,
          gender: user.gender,
          currentLocation: currentLocation,
          messages: newHistory // Pass the chat history
      } : { 
          currentLocation: currentLocation,
          messages: newHistory 
      };
      
      let aiResponse = await sendChatRequest(newHistory, userContext);
      newHistory.push(aiResponse);
      setMessages([...newHistory]);

      if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
        const toolResponses = await handleToolCalls(aiResponse.tool_calls, userContext);

        newHistory.push(...toolResponses);
        setMessages([...newHistory]);

        const triageResponse = toolResponses.find(r => r.content && JSON.parse(r.content).triageReport);
        if (triageResponse) {
          const content = JSON.parse(triageResponse.content!);
          const report = {
              ...content.triageReport,
              hospitalName: content.bookedHospital,
              distance: content.distance,
              eta: content.eta
          };

          newHistory.push({ role: 'assistant', content: 'TRIAGE_REPORT_UI', tool_call_id: JSON.stringify(report) } as any);
          setMessages([...newHistory]);
          return; // Stop here, UI will handle the rest
        }

        const finalResponse = await sendChatRequest(newHistory, userContext);
        newHistory.push(finalResponse);
        setMessages([...newHistory]);
      }

    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error connecting to AI: ${e.message}. Please configure OPENAI_API_KEY.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (msg: Message, index: number) => {

    if (msg.role === 'tool' || msg.tool_calls) {
      if (msg.tool_calls) {
        return (
          <View key={index} style={styles.systemMessage}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
            <Text style={styles.systemMessageText}>Booking appointment & routing data...</Text>
          </View>
        );
      }
      return null;
    }

    const isUser = msg.role === 'user';

    if (msg.content === 'TRIAGE_REPORT_UI') {
      const report = JSON.parse(msg.tool_call_id!);
      return (
        <TriageCard 
          key={index} 
          report={report} 
          onDone={() => router.replace('/(patient)/my-queue')} 
        />
      );
    }

    return (
      <View key={index} style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {msg.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Botsogo Assistant</Text>
        <Text style={styles.subtitle}>Check symptoms or ask medical questions</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble, { width: 60 }]}>
              <ActivityIndicator color={Colors.light.primary} size="small" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your symptoms here..."
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#ccfbf1',
    marginTop: 4,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: Colors.light.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#334155',
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  systemMessageText: {
    marginLeft: 8,
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 120,
    minHeight: 44,
    fontSize: 16,
    color: '#0f172a',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  triageCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 28,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  triageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '500',
  },
  triageInfo: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  queueBtn: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  queueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
