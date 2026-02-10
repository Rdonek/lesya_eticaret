import { AnimatedSplashScreen } from "@/components/shared/AnimatedSplash";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth-store";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../assets/global.css";

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();



function RootLayoutNav() {
  const { session, initialized } = useAuthStore();
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Initialize Auth Listener
  useAuth();

  useEffect(() => {
    if (!initialized || !isSplashComplete) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, initialized, segments, router, isSplashComplete]);

  if (!initialized || !isSplashComplete) {
    return <AnimatedSplashScreen onAnimationComplete={() => setIsSplashComplete(true)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}