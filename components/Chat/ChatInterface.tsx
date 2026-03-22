import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Modal, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';

type Message = {
  id: string; text: string; sender: 'me' | 'other'; time: string;
};

import { getActiveAppointmentSession, resolveConsultation, getPatientMedicalRecords } from '../../services/appointmentService';
import { getMedicationsList, prescribeMedications } from '../../services/inventoryService';
import { getPatientInsights, generatePatientInsights } from '../../services/patientService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatInterface({ isDoctorView }: { isDoctorView: boolean }) {
  const { id, name } = useLocalSearchParams(); 
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(true);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);
  
  // History states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pastRecords, setPastRecords] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Call simulation states
  const [isCalling, setIsCalling] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Prescription states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionStep, setPrescriptionStep] = useState(0); // 0: select, 1: details
  const [medications, setMedications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [medDetails, setMedDetails] = useState<Record<string, { quantity: string, instructions: string }>>({});
  const [diagnosis, setDiagnosis] = useState('');
  const [isPrescribing, setIsPrescribing] = useState(false);

  const themeColor = isDoctorView ? Colors.light.secondary : Colors.light.primary;
  const chatId = user?.uid && id ? [user.uid, id].sort().join('_') : null;

  useEffect(() => {
    const checkSession = async () => {
      if (!user?.uid || !id) return;
      const patientId = isDoctorView ? (id as string) : user.uid;
      const doctorId = isDoctorView ? user.uid : (id as string);
      const session = await getActiveAppointmentSession(patientId, doctorId);
      setSessionActive(!!session);
      if (session) setActiveAppointmentId(session.id!);
    };
    checkSession();
  }, [id, user]);

  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        let formattedTime = '';
        if (data.createdAt) {
          formattedTime = data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return {
          id: doc.id,
          text: data.text,
          sender: data.senderId === user?.uid ? 'me' : 'other',
          time: formattedTime
        } as Message;
      });
      setMessages(liveMessages);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCalling) {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const handleSend = async () => {
    if (!input.trim() || !chatId || !user || !sessionActive) return;
    const msgText = input.trim();
    setInput('');
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: msgText,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const loadMedications = async () => {
    console.log("Loading medications...");
    try {
      const list = await getMedicationsList();
      console.log(`Loaded ${list.length} medications.`);
      setMedications(list);
    } catch (e) {
      console.error("Error loading meds", e);
    }
  };

  const handlePrescribeAction = async () => {
    if (selectedMeds.length === 0 || !user?.uid || !id || !diagnosis.trim()) {
      alert("Please select medications and provide a diagnosis.");
      return;
    }

    const prescribedItems = selectedMeds.map(mid => ({
      medicationId: mid,
      quantity: parseFloat(medDetails[mid]?.quantity || '1'),
      instructions: medDetails[mid]?.instructions || 'As directed'
    }));

    if (prescribedItems.some(i => isNaN(i.quantity) || i.quantity <= 0)) {
      alert("Please enter valid quantities for all medications.");
      return;
    }

    setIsPrescribing(true);
    try {
      const patientId = isDoctorView ? (id as string) : user.uid;
      const results = await prescribeMedications(
        prescribedItems, 
        patientId, 
        user.uid, 
        user.name || user.displayName || 'Doctor',
        diagnosis
      );
      
      const itemSummaries = results.map(r => `• ${r.name}: ${r.quantity}${r.unit} - ${r.instructions}`).join('\n');
      const automatedMsg = `💊 PRESCRIPTION ISSUED\n\nDiagnosis: ${diagnosis}\n\nMedications:\n${itemSummaries}\n\nPlease visit the pharmacy for dispensing.`;

      await addDoc(collection(db, 'chats', chatId!, 'messages'), {
        text: automatedMsg,
        senderId: 'system_ai',
        createdAt: serverTimestamp()
      });
      
      setShowPrescriptionModal(false);
      setPrescriptionStep(0);
      setSelectedMeds([]);
      setMedDetails({});
      setDiagnosis('');
      alert("Prescription issued successfully!");
    } catch (e: any) {
      alert(e.message || "Failed to prescribe. Check stock levels.");
    } finally {
      setIsPrescribing(false);
    }
  };

  const handleEndConsultation = async () => {
    if (!activeAppointmentId) return;
    Alert.alert(
      "End Consultation",
      "Are you sure you want to resolve this consultation and close the chat?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End", style: "destructive", onPress: async () => {
          try {
            await resolveConsultation(activeAppointmentId);
            router.back();
          } catch (e) {
            console.error(e);
          }
        }}
      ]
    );
  };

  const loadPatientHistory = async () => {
    if (!id) return;
    setLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const records = await getPatientMedicalRecords(id as string);
      setPastRecords(records);
      const insightDoc = await getPatientInsights(id as string);
      setAiInsights(insightDoc?.summary || "No insights generated yet.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const generateNewInsights = async () => {
    if (!id) return;
    setLoadingHistory(true);
    try {
      const newSummary = await generatePatientInsights(id as string);
      setAiInsights(newSummary);
      alert("AI Clinical Profile refreshed!");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleMedSelection = (medId: string) => {
    setSelectedMeds(prev => 
      prev.includes(medId) ? prev.filter(i => i !== medId) : [...prev, medId]
    );
  };

  const updateMedDetail = (medId: string, field: 'quantity' | 'instructions', value: string) => {
    setMedDetails(prev => ({
      ...prev,
      [medId]: { ... (prev[medId] || { quantity: '1', instructions: '' }), [field]: value }
    }));
  };

  const startCall = (video: boolean) => {
    setIsVideo(video);
    setIsCalling(true);
  };

  const endCall = () => setIsCalling(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <FontAwesome5 name={isDoctorView ? "user" : "user-md"} size={20} color={themeColor} />
          </View>
          <Text style={styles.headerName}>{name || 'Unknown'}</Text>
        </View>
        <View style={styles.headerRight}>
          {isDoctorView && (
            <>
              <TouchableOpacity onPress={loadPatientHistory} style={[styles.iconBtn, { marginRight: 8 }]}>
                <FontAwesome5 name="file-medical" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => { setShowPrescriptionModal(true); setPrescriptionStep(0); loadMedications(); }} 
                style={styles.prescribeBtn}
              >
                <FontAwesome5 name="pills" size={16} color="#fff" />
                <Text style={styles.prescribeBtnText}>Prescribe</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEndConsultation} style={[styles.iconBtn, { marginRight: 8 }]}>
                <FontAwesome5 name="check-double" size={18} color="#fff" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => startCall(false)} style={styles.iconBtn}>
            <FontAwesome5 name="phone-alt" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => startCall(true)} style={[styles.iconBtn, { marginLeft: 16 }]}>
            <FontAwesome5 name="video" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView style={styles.chatArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!sessionActive && (
          <View style={styles.closedOverlay}>
            <FontAwesome5 name="lock" size={24} color="#64748b" />
            <Text style={styles.closedText}>This chat session is currently closed. It only opens when there is an active appointment.</Text>
          </View>
        )}
        
        {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={themeColor} size="large" />
            </View>
        ) : (
            <FlatList
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
                <View style={[styles.bubble, item.sender === 'me' ? [styles.myBubble, { backgroundColor: themeColor }] : styles.otherBubble]}>
                <Text style={[styles.bubbleText, item.sender === 'me' ? styles.myText : styles.otherText]}>
                    {item.text}
                </Text>
                <Text style={[styles.timeText, item.sender === 'me' ? styles.myTime : styles.otherTime]}>
                    {item.time}
                </Text>
                </View>
            )}
            />
        )}
        
        {/* Input Bar */}
        <View style={[styles.inputContainer, !sessionActive && { opacity: 0.5 }]}>
          <TouchableOpacity style={styles.attachBtn} disabled={!sessionActive}>
            <FontAwesome5 name="paperclip" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder={sessionActive ? "Type a message..." : "Session closed"}
            value={input}
            onChangeText={setInput}
            multiline
            editable={sessionActive}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: themeColor }, (!input.trim() || !sessionActive) && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!input.trim() || !sessionActive}
          >
            <FontAwesome5 name="paper-plane" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Prescription Modal */}
      <Modal visible={showPrescriptionModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={[styles.modalHeader, { backgroundColor: themeColor }]}>
            <TouchableOpacity onPress={() => {
              if (prescriptionStep === 1) setPrescriptionStep(0);
              else setShowPrescriptionModal(false);
            }}>
              <FontAwesome5 name={prescriptionStep === 1 ? "arrow-left" : "times"} size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{prescriptionStep === 0 ? "Select Medications" : "Prescription Details"}</Text>
            <View style={{ width: 22 }} />
          </View>

          {prescriptionStep === 0 ? (
            <>
              <View style={styles.searchBox}>
                <FontAwesome5 name="search" size={14} color="#94a3b8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search medication..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <FlatList
                data={medications.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => {
                  const selected = selectedMeds.includes(item.id);
                  return (
                    <TouchableOpacity 
                      style={[styles.medCard, selected && { borderColor: themeColor, borderWidth: 2 }]} 
                      onPress={() => toggleMedSelection(item.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.medName}>{item.name}</Text>
                        <Text style={styles.medCat}>{item.category}</Text>
                      </View>
                      {selected && <FontAwesome5 name="check-circle" size={20} color={themeColor} />}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', marginTop: 60, padding: 20 }}>
                    <FontAwesome5 name="pills" size={48} color="#cbd5e1" />
                    <Text style={{ marginTop: 16, color: '#64748b', textAlign: 'center', fontSize: 16 }}>
                      No medications found in inventory.{"\n"}
                      Please ask the pharmacist to seed the database.
                    </Text>
                  </View>
                }
              />

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.confirmBtn, { backgroundColor: themeColor }, selectedMeds.length === 0 && { opacity: 0.5 }]} 
                  onPress={() => setPrescriptionStep(1)}
                  disabled={selectedMeds.length === 0}
                >
                  <Text style={styles.confirmBtnText}>Next: Enter Details ({selectedMeds.length})</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.sectionTitle}>Diagnosis</Text>
              <TextInput
                style={styles.diagnosisInput}
                placeholder="Enter patient diagnosis..."
                value={diagnosis}
                onChangeText={setDiagnosis}
                multiline
              />

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Medication Details</Text>
              {selectedMeds.map(mid => {
                const med = medications.find(m => m.id === mid);
                return (
                  <View key={mid} style={styles.detailCard}>
                    <Text style={styles.detailMedName}>{med?.name}</Text>
                    <View style={styles.detailRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailLabel}>Quantity/Grams</Text>
                        <TextInput
                          style={styles.detailInput}
                          placeholder="e.g. 500"
                          value={medDetails[mid]?.quantity || '1'}
                          onChangeText={(v) => updateMedDetail(mid, 'quantity', v)}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    <Text style={[styles.detailLabel, { marginTop: 12 }]}>Dosage Instructions</Text>
                    <TextInput
                      style={styles.detailInput}
                      placeholder="e.g. Take twice daily after meals"
                      value={medDetails[mid]?.instructions || ''}
                      onChangeText={(v) => updateMedDetail(mid, 'instructions', v)}
                      multiline
                    />
                  </View>
                );
              })}

              <View style={{ height: 100 }} />
            </ScrollView>
          )}

          {prescriptionStep === 1 && (
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.confirmBtn, { backgroundColor: themeColor }, (isPrescribing || !diagnosis.trim()) && { opacity: 0.5 }]} 
                onPress={handlePrescribeAction}
                disabled={isPrescribing || !diagnosis.trim()}
              >
                {isPrescribing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm Prescription</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Patient History Modal */}
      <Modal visible={showHistoryModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={[styles.modalHeader, { backgroundColor: themeColor }]}>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
              <FontAwesome5 name="times" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Patient History & AI Insights</Text>
            <View style={{ width: 22 }} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View style={styles.insightBox}>
              <View style={styles.insightHeader}>
                <FontAwesome5 name="robot" size={18} color={themeColor} />
                <Text style={[styles.insightTitle, { color: themeColor }]}>AI Clinical Profile</Text>
                <TouchableOpacity onPress={generateNewInsights} style={styles.refreshBtn}>
                  <FontAwesome5 name="sync-alt" size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
              {loadingHistory ? (
                <ActivityIndicator color={themeColor} />
              ) : (
                <Text style={styles.insightText}>{aiInsights}</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Medical Records History</Text>
            {loadingHistory ? (
              <ActivityIndicator color={themeColor} />
            ) : pastRecords.length === 0 ? (
              <Text style={styles.emptyText}>No past records found.</Text>
            ) : (
              pastRecords.map((r, i) => (
                <View key={i} style={styles.recordMiniCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordTag}>{r.type.toUpperCase()}</Text>
                    <Text style={styles.recordDate}>{r.createdAt?.toDate().toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.recordDiagnosis}>{r.diagnosis}</Text>
                  {r.type === 'prescription' && r.details?.medications && (
                    <Text style={styles.recordMedSummary}>
                      Prescribed: {r.details.medications.map((m: any) => typeof m === 'object' ? m.name : m).join(', ')}
                    </Text>
                  )}
                </View>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8 },
  prescribeBtn: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 12, marginRight: 12 
  },
  prescribeBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginHorizontal: 12 },
  headerName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  chatArea: { flex: 1 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 16 },
  myBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  otherBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  myText: { color: '#fff' },
  otherText: { color: '#334155' },
  timeText: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
  myTime: { color: 'rgba(255,255,255,0.7)' },
  otherTime: { color: '#94a3b8' },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  attachBtn: { padding: 8, marginRight: 8 },
  textInput: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, minHeight: 40, fontSize: 16 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  
  // Call Overlay Styles
  callContainer: { flex: 1, backgroundColor: '#0f172a' },
  controlBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  endCallBtn: { backgroundColor: '#ef4444' },
  floatingEndCall: { position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 100, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  
  // New Styles
  modalHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  medCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderColor: '#e2e8f0', borderWidth: 1 },
  medName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  medCat: { fontSize: 12, color: '#64748b', marginTop: 2 },
  modalFooter: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  confirmBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closedOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 80, backgroundColor: 'rgba(248, 250, 252, 0.9)', zIndex: 10, justifyContent: 'center', alignItems: 'center', padding: 40 },
  closedText: { textAlign: 'center', color: '#64748b', marginTop: 16, fontSize: 15, lineHeight: 22 },
  
  // Detailed Prescription Styles
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginTop: 24 },
  diagnosisInput: { backgroundColor: '#fff', padding: 16, borderRadius: 12, fontSize: 16, color: '#0f172a', borderColor: '#e2e8f0', borderWidth: 1, minHeight: 80, textAlignVertical: 'top' },
  detailCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16, borderColor: '#e2e8f0', borderWidth: 1 },
  detailMedName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  detailRow: { flexDirection: 'row', gap: 12 },
  detailLabel: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginBottom: 6 },
  detailInput: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 15, color: '#0f172a', borderColor: '#e2e8f0', borderWidth: 1 },

  // Insight Styles
  insightBox: { backgroundColor: '#fff', padding: 18, borderRadius: 20, borderColor: '#e2e8f0', borderWidth: 1 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  insightTitle: { fontSize: 16, fontWeight: 'bold' },
  refreshBtn: { marginLeft: 'auto', padding: 6 },
  insightText: { fontSize: 15, color: '#475569', lineHeight: 22 },
  recordMiniCard: { backgroundColor: '#fff', padding: 14, borderRadius: 16, marginBottom: 12, borderColor: '#e2e8f0', borderWidth: 1 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  recordTag: { fontSize: 10, fontWeight: '900', color: Colors.light.primary },
  recordDate: { fontSize: 11, color: '#94a3b8' },
  recordDiagnosis: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  recordMedSummary: { fontSize: 12, color: '#64748b', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 10 },
});
