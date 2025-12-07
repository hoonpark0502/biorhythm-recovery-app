// api/subscribe.js
// DEBUG MODE: Logic commented out to test Vercel Deployment

export default async function handler(req, res) {
    return res.status(200).json({ status: "Debug Mode: API is reachable" });

    /*
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    // ... (rest of code hidden for debug)
    */
}
