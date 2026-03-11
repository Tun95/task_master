import * as admin from 'firebase-admin';
import { ConfigService } from './config.service';

export const initializeFirebase = (config: ConfigService) => {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error);
    }
  }
  return admin;
};

// Export the auth service directly from admin
export const firebaseAuth = admin.auth();
