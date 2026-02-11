import { AnimatedSplashScreen } from "@/components/shared/AnimatedSplash";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { useAuth } from "@/hooks/use-auth";
import { usePushToken } from "@/hooks/use-push-token";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth-store";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../assets/global.css";

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// --- NOTIFICATION HANDLER ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayoutNav() {
  const { session, initialized } = useAuthStore();
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useAuth();
  usePushToken();

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
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}