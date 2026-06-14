import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { UserId } from '../types';
import { saveFcmToken } from './db';

export async function initFCM(userId: UserId): Promise<void> {
  const authStatus = await requestPermission(getMessaging());
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  const token = await getToken(getMessaging());
  await saveFcmToken(userId, token);

  onTokenRefresh(getMessaging(), async newToken => {
    await saveFcmToken(userId, newToken);
  });
}

export function onForegroundMessage(
  handler: (title: string, body: string) => void,
): () => void {
  return onMessage(getMessaging(), async remoteMessage => {
    const title = remoteMessage.notification?.title ?? '';
    const body = remoteMessage.notification?.body ?? '';
    handler(title, body);
  });
}

// Must be called outside of any component (at app root level)
export function registerBackgroundHandler(): void {
  setBackgroundMessageHandler(getMessaging(), async () => {});
}

export function getPartnerName(userId: UserId): string {
  return userId === 'jasper' ? 'Senja' : 'Jasper';
}

export function getPartnerId(userId: UserId): UserId {
  return userId === 'jasper' ? 'senja' : 'jasper';
}
