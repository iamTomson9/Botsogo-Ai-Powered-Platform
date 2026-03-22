import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
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
            <FontAwesome5 name="sign-out-alt" size={20} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pharmacy',
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: 'Prescriptions',
          tabBarIcon: ({ color }) => <FontAwesome5 name="file-prescription" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dispense"
        options={{
          title: 'Dispense',
          tabBarIcon: ({ color }) => <FontAwesome5 name="capsules" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <FontAwesome5 name="boxes" size={22} color={color} />,
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
        name="chat/[id]"
        options={{
          href: null,
          title: 'Chat',
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }) => <FontAwesome5 name="shippings" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
