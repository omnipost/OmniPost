// src/services/notifications.ts
// Push notification setup for React Native (FCM + APNs)
// Install: npm install @react-native-firebase/app @react-native-firebase/messaging

/**
 * SETUP INSTRUCTIONS:
 *
 * 1. Create a Firebase project at console.firebase.google.com
 * 2. Add Android app (package: com.omnipost) → download google-services.json → place in android/app/
 * 3. Add iOS app (bundle: in.omnipost.app) → download GoogleService-Info.plist → place in ios/OmniPost/
 * 4. npm install @react-native-firebase/app @react-native-firebase/messaging
 * 5. Follow platform setup: https://rnfirebase.io/
 */

// Uncomment after installing Firebase:
/*
import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED
        || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  }
  return true; // Android grants permission automatically
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    // TODO: Send token to backend → store in users.fcm_token
    // await usersApi.updateFcmToken(token);
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

export function setupNotificationListeners(onNotification: (payload: any) => void) {
  // Foreground notifications
  const unsubForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification:', remoteMessage);
    onNotification(remoteMessage);
  });

  // Background / quit state
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background notification:', remoteMessage);
  });

  // When user taps a notification
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened app:', remoteMessage);
    // TODO: Navigate to relevant screen based on remoteMessage.data
  });

  return unsubForeground; // call this on unmount
}
*/

// Placeholder until Firebase is set up
export async function requestNotificationPermission() { return false; }
export async function getFCMToken() { return null; }
export function setupNotificationListeners(_cb: any) { return () => {}; }
