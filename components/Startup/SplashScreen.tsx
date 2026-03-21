import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AiHcpLogo } from './AiHcpLogo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/slide1');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <AiHcpLogo size={100} color="white" />
        <Text style={styles.brandName}>AI-HCP</Text>
        <Text style={styles.tagline}>Botsogo AI Health Companion</Text>
      </View>
      <Text style={styles.credit}>Designed by AutoBots Botswana</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5BAFB8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 20,
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  credit: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '400',
  },
});
