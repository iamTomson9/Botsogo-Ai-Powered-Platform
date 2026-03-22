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
    const inOnboarding = segments[0] === '(onboarding)';
    const inApp = segments[0] === '(app)';

    if (!user && !inAuthGroup && !inOnboarding) {

      const wasInApp = ['(admin)', '(doctor)', '(patient)', '(pharmacist)', '(app)', '(tabs)'].includes(segments[0]);
      if (wasInApp) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(onboarding)/splash');
      }
    } else if (user && !['(admin)', '(doctor)', '(patient)', '(pharmacist)', '(app)'].includes(segments[0])) {

      const role: string = user.role || 'patient';
      if (role === 'admin') {
        router.replace('/(admin)');
      } else if (role === 'doctor') {
        router.replace('/(doctor)');
      } else if (role === 'pharmacist') {
        router.replace('/(pharmacist)');
      } else {
        router.replace('/(patient)');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#5BAFB8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#fff" size="large" />
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
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(doctor)" />
          <Stack.Screen name="(patient)" />
          <Stack.Screen name="(pharmacist)" />
        </Stack>
      </AuthGuard>
      <StatusBar style="light" backgroundColor="#5BAFB8" />
    </>
  );
}

