// api/cron.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export default async function handler(req, res) {
    try {
        // 1. Determine current hour in User's Timezone (Assume KR/JST +9 for this user, or UTC handling)
        // Vercel Cron runs on UTC.
        // If user wants 08:00 KST, that is 23:00 UTC (previous day).
        // Let's assume the user inputs time in "Local (KST)" and we run Cron every hour.

        const now = new Date();
        // Convert to KST (UTC+9)
        const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const currentHour = kstTime.getUTCHours();
        // Wait, getUTCHours of modified date is mostly correct for simple math
        // Better:
        // const kstDate = new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"});
        // const hour = new Date(kstDate).getHours();

        // Let's stick to simple offset for robustness in Node environment
        // UTC hour:
        const utcHour = now.getUTCHours();
        // Target KST Hour: (utcHour + 9) % 24
        let targetHour = (utcHour + 9) % 24;

        // Format to '08', '20' etc.
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
        // If topic has no subscribers, FCM might throw error or return failure.
        // We catch it and just say OK/Skip.
        console.log('Error or No subscribers for this hour:', error.code);
        return res.status(200).json({ status: 'No messages sent or error', details: error.message });
    }
}
