import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { Colors } from '../../constants/Colors';

const handleLogout = () => {
  Alert.alert('Sign Out', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log Out', style: 'destructive', onPress: () => signOut(getAuth()) }
  ]);
};

export default function DoctorLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.secondary, // Uses a slightly different teal
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: '#e2e8f0',
        },
        headerStyle: {
          backgroundColor: Colors.light.secondary,
        },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20 }}>
            <FontAwesome5 name="sign-out-alt" size={20} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Doctor Portal',
          tabBarIcon: ({ color }) => <FontAwesome5 name="user-md" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Patient Queue',
          tabBarIcon: ({ color }) => <FontAwesome5 name="clipboard-list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <FontAwesome5 name="envelope" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diagnostics"
        options={{
          title: 'Diagnostics',
          tabBarIcon: ({ color }) => <FontAwesome5 name="x-ray" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="escalations"
        options={{
          title: 'Escalations',
          tabBarIcon: ({ color }) => <FontAwesome5 name="exclamation-circle" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Medications',
          tabBarIcon: ({ color }) => <FontAwesome5 name="pills" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transcription"
        options={{
          title: 'Transcribe',
          tabBarIcon: ({ color }) => <FontAwesome5 name="microphone" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
          title: 'Chat',
        }}
      />
    </Tabs>
  );
}
