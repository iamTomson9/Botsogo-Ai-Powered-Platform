import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AiHcpLogo } from './AiHcpLogo';

const { height } = Dimensions.get('window');

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo area */}
      <View style={styles.logoArea}>
        <AiHcpLogo size={80} color="#5BAFB8" />
        <Text style={styles.brandName}>AI-HCP</Text>
        <Text style={styles.brandSub}>Botsogo AI Health Companion</Text>
      </View>

      {/* Headline + subtitle */}
      <View style={styles.textArea}>
        <Text style={styles.headline}>Let's get started!</Text>
        <Text style={styles.subtitle}>
          Login to enjoy the features we've provided, and stay healthy!
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Login button — filled teal */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/(auth)/login?mode=login')}
          activeOpacity={0.85}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        {/* Sign Up button — outlined teal */}
        <TouchableOpacity
          style={styles.signUpBtn}
          onPress={() => router.push('/(auth)/login?mode=signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.signUpBtnText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 50,
  },
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5BAFB8',
    letterSpacing: 3,
    marginTop: 12,
  },
  brandSub: {
    fontSize: 12,
    color: '#828282',
    fontWeight: '400',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  textArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#828282',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: 300,
  },
  actions: {
    width: '100%',
    gap: 14,
  },
  loginBtn: {
    backgroundColor: '#5BAFB8',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#5BAFB8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  signUpBtn: {
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5BAFB8',
  },
  signUpBtnText: {
    color: '#5BAFB8',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
