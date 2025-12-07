// api/cron.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export default async function handler(req, res) {
    // 1. Safe Initialization inside Handler
    // This prevents build-time crashes if Env Vars are missing in build context.
    try {
        if (!getApps().length) {
            // Check if env var exists before parsing
            if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
                throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
            }
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount)
            });
        }
    } catch (e) {
        console.error("Firebase Admin Init Error:", e);
        // We log it and return 500, but this won't crash the *Build* process hopefully
        return res.status(500).json({ error: "Server Configuration Error: " + e.message });
    }

    try {
        // 2. Logic to determine Topic by User Time (KST)
        const now = new Date();
        const utcHour = now.getUTCHours();

        // KST is UTC+9.
        // If it is 23:00 UTC (previous day), it is 08:00 KST (today).
        // (23 + 9) % 24 = 32 % 24 = 8.
        let targetHour = (utcHour + 9) % 24;

        const hourStr = targetHour.toString().padStart(2, '0');
        const topic = `alarm_${hourStr}`;

        console.log(`Cron running at UTC ${utcHour}, Target KST ${hourStr}, Topic: ${topic}`);

        const message = {
            notification: {
                title: 'Rhythm Check 🌿',
                body: `It's ${hourStr}:00. Time to check your rhythm.`,
            },
            topic: topic,
            webpush: {
                fcm_options: {
                    link: 'https://biorhythm-sol.vercel.app/'
                }
            }
        };

        const response = await getMessaging().send(message);
        console.log(`Sent to ${topic}:`, response);
        return res.status(200).json({ success: true, topic, response });

    } catch (error) {
        console.log('Error sending message (or no subscribers):', error.message);
        return res.status(200).json({ status: 'No messages sent or error', details: error.message });
    }
}
