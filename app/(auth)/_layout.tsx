import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#011c16' } }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
