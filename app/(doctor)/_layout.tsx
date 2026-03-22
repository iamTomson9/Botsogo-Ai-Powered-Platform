import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { Alert, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/Colors";

const handleLogout = () => {
  Alert.alert("Sign Out", "Are you sure you want to log out?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Log Out",
      style: "destructive",
      onPress: () => signOut(getAuth()),
    },
  ]);
};

export default function DoctorLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.secondary,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: "#e2e8f0",
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: Colors.light.secondary,
        },
        headerTintColor: "#fff",
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
          title: "Portal",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="escalations"
        options={{
          title: "Escalated",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "alert-circle" : "alert-circle-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "Meds",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "medical" : "medical-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="queue" options={{ href: null }} />
      <Tabs.Screen name="diagnostics" options={{ href: null }} />
      <Tabs.Screen name="transcription" options={{ href: null }} />
      <Tabs.Screen name="chat/[id]" options={{ href: null }} />
    </Tabs>
  );
}
