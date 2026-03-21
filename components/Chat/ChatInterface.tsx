import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
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

export default function ChatInterface({ isDoctorView }: { isDoctorView: boolean }) {
  const { id, name } = useLocalSearchParams(); // `id` is the OTHER person's userId
  const { user } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Call simulation states
  const [isCalling, setIsCalling] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const themeColor = isDoctorView ? Colors.light.secondary : Colors.light.primary;

  // Determine an exact identical chat ID regardless of who initiates (e.g. sorted alphabetical)
  const chatId = user?.uid && id ? [user.uid, id].sort().join('_') : null;

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
    if (!input.trim() || !chatId || !user) return;
    const msgText = input.trim();
    setInput(''); // Optimistic clear
    
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

  const startCall = (video: boolean) => {
    setIsVideo(video);
    setIsCalling(true);
  };

  const endCall = () => {
    setIsCalling(false);
  };

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
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <FontAwesome5 name="paperclip" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: themeColor }, !input.trim() && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <FontAwesome5 name="paper-plane" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Live WebRTC Call Modal Overlay */}
      <Modal visible={isCalling} animationType="slide" transparent={false}>
        <View style={styles.callContainer}>
          {isCalling && chatId && (
            <WebView
              source={{ uri: `https://meet.jit.si/BotsogoHealth_${chatId}#config.startWithVideoMuted=${!isVideo}&config.startWithAudioMuted=false` }}
              style={{ flex: 1, width: '100%', backgroundColor: '#0f172a' }}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
            />
          )}

          {/* Floating End Call Button to manually close the modal */}
          <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn, styles.floatingEndCall]} onPress={endCall}>
            <FontAwesome5 name="phone-slash" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
  floatingEndCall: { position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 100, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }
});
