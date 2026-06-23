import { Stack } from 'expo-router';

// Expo Router root (PRD §3.3). Three screens: inbox / approval detail / receipt.
export default function RootLayout() {
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
