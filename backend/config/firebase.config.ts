import * as admin from 'firebase-admin';
import { ConfigService } from './config.service';

// Store the app instance but also use it
let firebaseApp: admin.app.App;

export const initializeFirebase = (config: ConfigService) => {
  if (!admin.apps.length) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized successfully');

      // Return the app for potential use
      return firebaseApp;
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error);
      throw error;
    }
  }

  // Get existing app
  firebaseApp = admin.apps[0] as admin.app.App;
  return firebaseApp;
};

// Export a function to get auth after initialization
export const getFirebaseAuth = () => {
  if (!admin.apps.length) {
    throw new Error('Firebase must be initialized before accessing auth');
  }
  return admin.auth();
};

export const getFirebaseApp = () => {
  if (!admin.apps.length) {
    throw new Error('Firebase must be initialized before accessing app');
  }
  return firebaseApp || admin.apps[0];
};
