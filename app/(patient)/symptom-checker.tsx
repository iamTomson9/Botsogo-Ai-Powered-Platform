import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  return (
    <View style={styles.triageCard}>
      <View style={styles.successCircle}>
        <FontAwesome5 name="check" size={24} color="#fff" />
      </View>
      <Text style={styles.triageTitle}>Appointment Booked!</Text>
      <Text style={styles.triageSummary}>
        Your request has been sent to **{report.hospitalName || "General Hospital"}**. 
        A doctor will review your triage summary shortly.
      </Text>

      <TouchableOpacity style={styles.queueBtn} onPress={onDone}>
        <Text style={styles.queueBtnText}>View My Queue</Text>
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
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: `Hello ${user.displayName || 'there'}! I am Botsogo AI. I see your next appointment is unscheduled. How are you feeling today?` }
      ]);
    }
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when messages update
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
      const userContext = user ? { uid: user.uid, name: user.displayName || 'Patient' } : undefined;
      let aiResponse = await sendChatRequest(newHistory, userContext);
      newHistory.push(aiResponse);
      setMessages([...newHistory]);

      // Handle function calls if the AI decides to perform actions
      if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
        const toolResponses = await handleToolCalls(aiResponse.tool_calls, userContext);
        
        // Push tool responses to history
        newHistory.push(...toolResponses);
        setMessages([...newHistory]);
        
        // Check if any tool response contains a triage report
        const triageResponse = toolResponses.find(r => r.content && JSON.parse(r.content).triageReport);
        if (triageResponse) {
          const report = JSON.parse(triageResponse.content!).triageReport;
          // Add a special pseudo-message to trigger the TriageCard rendering
          newHistory.push({ role: 'assistant', content: 'TRIAGE_REPORT_UI', tool_call_id: JSON.stringify(report) } as any);
          setMessages([...newHistory]);
          return; // Stop here, UI will handle the rest
        }

        // Re-request AI logic with tool results
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
    // Hide tool execution messages from the UI
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
            <FontAwesome5 name="paper-plane" size={16} color="#fff" />
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  triageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  triageSummary: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  queueBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  queueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
