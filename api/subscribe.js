// api/subscribe.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!getApps().length) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount)
            });
        }
    } catch (e) {
        console.error("Firebase Admin Init Error:", e);
        return res.status(500).json({ error: "Server Configuration Error" });
    }

    const { token, time } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    // Default to '08' if no time provided
    const hour = time || '08';
    // Topic: 'alarm_08', 'alarm_21', etc.
    const topic = `alarm_${hour}`;

    try {
        await getMessaging().subscribeToTopic([token], topic);
        console.log(`Subscribed ${token} to ${topic}`);

        // Note: Ideally we should unsubscribe from other `alarm_*` topics here
        // But for MVP we skip complex tracking. Multi-sub just means backup alarms?
        // Or actually, user might get double alarms if they change time.
        // A smarter way: Client sends 'oldTime' too?
        // We'll leave as simple add-on for now.

        return res.status(200).json({ success: true, topic });
    } catch (error) {
        console.error('Error subscribing:', error);
        return res.status(500).json({ error: error.message });
    }
}
