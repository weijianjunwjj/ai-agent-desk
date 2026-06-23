import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Expo Router root (PRD §3.3). Three screens: inbox / approval detail / receipt.
export default function RootLayout() {
  const router = useRouter();

  // Tapping a push notification opens its approval detail (PRD §8.5 / §10).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const taskId = response.notification.request.content.data?.taskId;
      if (typeof taskId === 'string') {
        router.push({ pathname: '/approval/[id]', params: { id: taskId } });
      }
    });
    return () => subscription.remove();
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1677ff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="index" options={{ title: '待审批收件箱' }} />
      <Stack.Screen name="approval/[id]" options={{ title: '审批详情' }} />
      <Stack.Screen name="receipt/[id]" options={{ title: '状态回执' }} />
    </Stack>
  );
}
