// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// TODO: Replace the following with your app's Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
    try {
        if (!('Notification' in window)) {
            throw new Error("Notifications are not supported in this browser.\n(If on iPhone, tap Share -> 'Add to Home Screen' and open the app from there to enable notifications.)");
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            throw new Error(`Permission not granted (Status: ${permission})`);
        }

        // TODO: Replace with your VAPID Key from Firebase Console -> Cloud Messaging -> Web Push certificates
        const vapidKey = "BDraOyRSpQPYXSS3oPhIJa0MkxBmWLS97bNublcdepKSXEAI3afT6iIZ2BrejanuTLSJl1V-XZNMY98VKmQxUf8";

        if (!vapidKey || vapidKey.startsWith("REPLACE")) {
            throw new Error("VAPID Key is missing or invalid.");
        }

        const token = await getToken(messaging, { vapidKey });
        console.log("FCM Token:", token);
        return token;

    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
        throw error; // Propagate error to UI
    }
};
