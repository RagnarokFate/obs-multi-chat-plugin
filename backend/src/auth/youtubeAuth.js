const express = require('express');
const axios = require('axios');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return res.status(500).send("YouTube OAuth variables missing in .env");
    }

    const scope = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).send(`Auth Failed: ${error}`);
    }

    try {
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.YOUTUBE_CLIENT_ID,
            client_secret: process.env.YOUTUBE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.YOUTUBE_REDIRECT_URI
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
            ['youtube', access_token, refresh_token || 'none', expires_at],
            (err) => {
                if (err) return res.status(500).send("Failed to save YouTube token.");
                res.send("<h2>YouTube Authentication Successful!</h2><p>You can close this window and return to the Dashboard.</p><script>setTimeout(() => window.close(), 2000);</script>");
            }
        );

    } catch (err) {
        console.error("YouTube token exchange error:", err.response?.data || err.message);
        res.status(500).send("Failed to exchange code for token.");
    }
});

module.exports = router;
