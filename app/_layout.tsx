import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user) {
      const role: string = user.role || 'patient';
      if (role === 'admin') {
        router.replace('/(app)/admin');
      } else if (role === 'doctor') {
        router.replace('/(app)/doctor');
      } else {
        router.replace('/(app)/patient');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#011c16', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </AuthGuard>
      <StatusBar style="light" backgroundColor="#011c16" />
    </>
  );
}

