import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { Colors } from '../../constants/Colors';

const PHARMACIST_TEAL = '#0E7490'; // Cyan-700 - slightly distinct from doctor teal

const handleLogout = () => {
  Alert.alert('Sign Out', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log Out', style: 'destructive', onPress: () => signOut(getAuth()) },
  ]);
};

export default function PharmacistLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PHARMACIST_TEAL,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: '#e2e8f0',
        },
        headerStyle: {
          backgroundColor: PHARMACIST_TEAL,
        },
        headerTintColor: '#fff',
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20 }}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Portal',
          tabBarIcon: ({ color }) => <Ionicons name="apps-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Prescriptions',
          tabBarIcon: ({ color }) => <Ionicons name="clipboard-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dispense"
        options={{
          href: null,
          title: 'Dispense',
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: null,
          title: 'Messages',
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Logistics',
          tabBarIcon: ({ color }) => <Ionicons name="swap-horizontal-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
