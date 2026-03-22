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

export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: '#e2e8f0',
        },
        headerStyle: {
          backgroundColor: Colors.light.primary,
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
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="symptom-checker"
        options={{
          title: 'Symptom Checker',
          tabBarIcon: ({ color }) => <FontAwesome5 name="stethoscope" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clinics"
        options={{
          title: 'Find Clinic',
          tabBarIcon: ({ color }) => <FontAwesome5 name="hospital" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <FontAwesome5 name="envelope" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null, // Hides this from the bottom tab bar
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="book-appointment"
        options={{ href: null, title: 'Book Appointment' }}
      />
      <Tabs.Screen
        name="my-queue"
        options={{ href: null, title: 'My Queue' }}
      />
      <Tabs.Screen
        name="records"
        options={{ href: null, title: 'Medical Records' }}
      />
    </Tabs>
  );
}
