import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';

export default function NotFoundScreen() {
  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-xl font-bold text-foreground">This screen doesn't exist.</Text>
        <Link href="/" className="bg-primary px-4 py-2 rounded-lg">
          <Text className="text-primary-foreground">Go to home screen</Text>
        </Link>
      </View>
    </ScreenWrapper>
  );
}
