// Expo Notifications — simulated push link (PRD §8.5 / §10). We use LOCAL
// notifications (no real remote APNs; the spec says 模拟推送): scheduling one
// stands in for "Web pushed a mobile-approval task". Tapping it routes to the
// approval detail (see app/_layout.tsx). On web, notifications are unsupported,
// so sendApprovalPush returns false and the caller falls back to in-app nav.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const isNative = Platform.OS !== 'web';

if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNative) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export interface ApprovalPushInput {
  taskId: string;
  customerName: string;
  actionTitle: string;
}

// Returns true if a real local notification was scheduled (native device);
// false on web so the caller can fall back to direct navigation.
export async function sendApprovalPush(input: ApprovalPushInput): Promise<boolean> {
  if (!isNative) return false;
  const granted = await ensureNotificationPermission();
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '待审批动作',
      body: `${input.customerName} · ${input.actionTitle}`,
      data: { taskId: input.taskId },
    },
    trigger: null, // deliver immediately
  });
  return true;
}
