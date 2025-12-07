// api/cron.js
// Dynamic imports to ensure Vercel builds successfully

export default async function handler(req, res) {
    try {
        // Dynamic Import
        const { initializeApp, getApps, cert } = await import('firebase-admin/app');
        const { getMessaging } = await import('firebase-admin/messaging');

        // Initialize
        if (!getApps().length) {
            if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
                // If Env Var is missing in running context, we can't do anything.
                // But catching this prevents crash loop maybe?
                throw new Error("Missing FIREBASE_SERVICE_ACCOUNT");
            }
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount)
            });
        }

        // Logic
        const now = new Date();
        const utcHour = now.getUTCHours(); // UTC

        // KST = UTC+9
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
        console.log('Cron Job Error:', error.message);
        return res.status(200).json({ status: 'Error', details: error.message });
    }
}
