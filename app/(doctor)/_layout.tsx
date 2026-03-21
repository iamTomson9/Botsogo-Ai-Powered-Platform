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
    </Tabs>
  );
}
