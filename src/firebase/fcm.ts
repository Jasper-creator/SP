import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { UserId } from '../types';
import { saveFcmToken } from './db';

export async function initFCM(userId: UserId): Promise<void> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  const token = await messaging().getToken();
  await saveFcmToken(userId, token);

  messaging().onTokenRefresh(async newToken => {
    await saveFcmToken(userId, newToken);
  });
}

export function onForegroundMessage(
  handler: (title: string, body: string) => void,
): () => void {
  return messaging().onMessage(async remoteMessage => {
    const title = remoteMessage.notification?.title ?? '';
    const body = remoteMessage.notification?.body ?? '';
    handler(title, body);
  });
}

// Must be called outside of any component (at app root level)
export function registerBackgroundHandler(): void {
  messaging().setBackgroundMessageHandler(async () => {});
}

export function getPartnerName(userId: UserId): string {
  return userId === 'jasper' ? 'Senja' : 'Jasper';
}

export function getPartnerId(userId: UserId): UserId {
  return userId === 'jasper' ? 'senja' : 'jasper';
}
