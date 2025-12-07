// api/subscribe.js
// We use dynamic imports to prevent build-time resolution errors

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Dynamic Import: Load firebase-admin only at runtime
        const { initializeApp, getApps, cert } = await import('firebase-admin/app');
        const { getMessaging } = await import('firebase-admin/messaging');

        if (!getApps().length) {
            if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
                throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var");
            }
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount)
            });
        }

        const { token, time } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Missing token' });
        }

        // Default to '08' if no time provided
        const hour = time || '08';
        const topic = `alarm_${hour}`;

        await getMessaging().subscribeToTopic([token], topic);
        console.log(`Subscribed ${token} to ${topic}`);

        return res.status(200).json({ success: true, topic });

    } catch (error) {
        console.error('Error in subscribe handler:', error);
        return res.status(500).json({ error: error.message });
    }
}
