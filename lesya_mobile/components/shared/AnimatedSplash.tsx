import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  runOnJS,
  withSpring,
  withSequence
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

export function AnimatedSplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  // Initial states: Everything hidden and slightly smaller
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Prepare and show
    const startSequence = async () => {
      try {
        // Wait a tiny bit for the JS engine to be 100% ready
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Hide native splash screen
        await SplashScreen.hideAsync();

        // 2. ENTRANCE: The "Premium" Bounce
        // Scale with a nice spring damping
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 100,
          mass: 1,
        });
        
        // Fade in logo
        opacity.value = withTiming(1, { 
          duration: 800, 
          easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
        });

        // 3. TEXT ENTRANCE: Delayed and elegant
        textOpacity.value = withDelay(800, withTiming(0.6, { 
          duration: 1000 
        }));

        // 4. EXIT: Smooth fade out after holding
        setTimeout(() => {
          // Fade everything out together
          opacity.value = withTiming(0, { duration: 800 });
          textOpacity.value = withTiming(0, { duration: 800 });
          
          // Final callback to App
          setTimeout(() => {
            onAnimationComplete();
          }, 850);
        }, 3000);

      } catch (e) {
        onAnimationComplete(); // Fallback
      }
    };

    startSequence();
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
        <Text style={styles.version}>v1.0.2 • PREMIUM ACCESS</Text>
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
    gap: 24,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    backgroundColor: '#ffffff',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
    marginBottom: 10
  },
  logo: {
    width: 70,
    height: 70,
  },
  textWrapper: {
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  version: {
    color: '#262626',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});
