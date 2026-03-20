import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AiHcpLogo } from './AiHcpLogo';

const { width, height } = Dimensions.get('window');

interface SlideData {
  image: any;
  headline: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    image: require('../../assets/images/onboarding1.png'),
    headline: 'Consult only with a doctor you trust',
    subtitle: 'Get expert medical advice from certified doctors from the comfort of your home.',
  },
  {
    image: require('../../assets/images/onboarding2.png'),
    headline: 'Track your health, every single day',
    subtitle: 'Monitor vitals, appointments, and AI-driven health insights all in one place.',
  },
  {
    image: require('../../assets/images/onboarding3.png'),
    headline: 'Medications & prescriptions, simplified',
    subtitle: 'Manage your medicines, refills, and dosage reminders with ease.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setCurrentIndex(next);
    } else {
      router.replace('/(onboarding)/get-started');
    }
  };

  const skip = () => {
    router.replace('/(onboarding)/get-started');
  };

  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const slide = SLIDES[currentIndex];

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Illustration area */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        style={styles.slider}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={styles.slide}>
            <Image source={s.image} style={styles.illustration} resizeMode="contain" />
          </View>
        ))}
      </ScrollView>

      {/* Bottom card */}
      <View style={styles.card}>
        <Text style={styles.headline}>{slide.headline}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Pagination + Next button */}
        <View style={styles.footer}>
          {/* Pagination dots */}
          <View style={styles.pagination}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Next arrow button */}
          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: '#828282',
    fontSize: 15,
    fontWeight: '500',
  },
  slider: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 20,
  },
  illustration: {
    width: width * 0.75,
    height: height * 0.38,
  },
  card: {
    backgroundColor: '#F0F4F7',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 32,
    paddingHorizontal: 28,
    paddingBottom: 44,
    minHeight: height * 0.30,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: '#828282',
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 28,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#5BAFB8',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  nextBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#5BAFB8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5BAFB8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  nextArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
});
