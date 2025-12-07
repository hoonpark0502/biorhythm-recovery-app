// Give the service worker access to Firebase Messaging.
// Note: We need to use importScripts to load the external Firebase SDK inside the Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
// TODO: Replace with your Sender ID (found in firebaseConfig.messagingSenderId)
const firebaseConfig = {
  apiKey: "AIzaSyD22z8QTfTbBMs3uw0n5rZG5IB42O_g15Y",
  authDomain: "biorhythm-sol.firebaseapp.com",
  projectId: "biorhythm-sol",
  storageBucket: "biorhythm-sol.firebasestorage.app",
  messagingSenderId: "423379924064",
  appId: "1:423379924064:web:8a63688ebb2b36749fbf05",
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
