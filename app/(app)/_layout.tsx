import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#011c16' } }}>
      <Stack.Screen name="patient" />
      <Stack.Screen name="doctor" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}
