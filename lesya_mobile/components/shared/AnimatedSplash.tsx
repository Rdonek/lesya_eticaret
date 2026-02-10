import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  withSpring
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

export function AnimatedSplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Güvenlik Kilidi: Eğer bir şekilde animasyon takılırsa 5 saniye sonra uygulamayı aç
    const safetyTimeout = setTimeout(() => {
      onAnimationComplete();
    }, 5000);

    const runAnimation = async () => {
      try {
        // 1. Yerel Splash Ekranını Gizle
        await SplashScreen.hideAsync().catch(() => {});

        // 2. Giriş Animasyonu
        scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });

        // 3. Yazı Girişi
        textOpacity.value = withDelay(400, withTiming(0.7, { duration: 800 }));

        // 4. Çıkış ve Kapanış (Daha hızlı: 2 saniye bekleme)
        setTimeout(() => {
          opacity.value = withTiming(0, { duration: 500 });
          textOpacity.value = withTiming(0, { duration: 500 });

          setTimeout(() => {
            clearTimeout(safetyTimeout);
            onAnimationComplete();
          }, 550);
        }, 2000);

      } catch (e) {
        clearTimeout(safetyTimeout);
        onAnimationComplete();
      }
    };

    runAnimation();

    return () => clearTimeout(safetyTimeout);
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedLogoStyle]}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('@/assets/lesya_favicon/android/res/mipmap-xxxhdpi/lesya_launcher_foreground.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Animated.View style={[styles.textWrapper, animatedTextStyle]}>
          <Text style={styles.title}>LESYA</Text>
          <Text style={styles.subtitle}>COMMAND CENTER</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.5 • PRODUCTION READY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 100,
    height: 100,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24
  },
  logo: {
    width: 60,
    height: 60,
  },
  textWrapper: {
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 5,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.5
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  version: {
    color: '#1a1a1a',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});