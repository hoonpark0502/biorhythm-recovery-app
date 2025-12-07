// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// TODO: Replace the following with your app's Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
    apiKey: "AIzaSyD22z8QTfTbBMs3uw0n5rZG5IB42O_g15Y",
    authDomain: "biorhythm-sol.firebaseapp.com",
    projectId: "biorhythm-sol",
    storageBucket: "biorhythm-sol.firebasestorage.app",
    messagingSenderId: "423379924064",
    appId: "1:423379924064:web:8a63688ebb2b36749fbf05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Function to request permission and get token
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // TODO: Replace with your VAPID Key from Firebase Console -> Cloud Messaging -> Web Push certificates
            const vapidKey = "REPLACE_WITH_YOUR_VAPID_KEY";

            const token = await getToken(messaging, { vapidKey });
            console.log("FCM Token:", token);
            return token;
        } else {
            console.log('Notification permission denied.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
        return null;
    }
};
