const express = require('express');
const axios = require('axios');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const redirectUri = process.env.TWITCH_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return res.status(500).send("Twitch OAuth variables missing in .env");
    }

    const scope = 'chat:read chat:edit channel:moderate';
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;

    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).send(`Auth Failed: ${error}`);
    }

    try {
        const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.TWITCH_REDIRECT_URI
            }
        });

        const { access_token, refresh_token, expires_in } = tokenRes.data;
        const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();

        db.run(
            `INSERT INTO tokens (platform, access_token, refresh_token, expires_at) 
             VALUES (?, ?, ?, ?)
             ON CONFLICT(platform) DO UPDATE SET 
             access_token=excluded.access_token, 
             refresh_token=excluded.refresh_token, 
             expires_at=excluded.expires_at`,
            ['twitch', access_token, refresh_token, expires_at],
            (err) => {
                if (err) return res.status(500).send("Failed to save Twitch token.");
                res.send("<h2>Twitch Authentication Successful!</h2><p>You can close this window and return to the Dashboard.</p><script>setTimeout(() => window.close(), 2000);</script>");
            }
        );

    } catch (err) {
        console.error("Twitch token exchange error:", err.response?.data || err.message);
        res.status(500).send("Failed to exchange code for token.");
    }
});

module.exports = router;
