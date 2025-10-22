import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

export const messaging = admin.messaging();

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  token: string,
  payload: PushNotificationPayload
): Promise<string> {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      token: token,
    };

    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function sendMulticastNotification(
  tokens: string[],
  payload: PushNotificationPayload
): Promise<admin.messaging.BatchResponse> {
  try {
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} messages`);
    return response;
  } catch (error) {
    console.error('Error sending multicast message:', error);
    throw error;
  }
}

