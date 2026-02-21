const tmi = require('tmi.js');
const { normalizeTwitch } = require('../normalizer');

class TwitchManager {
    constructor(io) {
        this.io = io;
        this.client = null;
        this.username = null;
    }

    async setupListeners() {
        this.client.on('message', (channel, tags, message, self) => {
            if (self) return; // Ignore messages from the bot itself

            // Normalize the message to the standard format
            const normalizedMsg = normalizeTwitch(tags, message);

            // Emit the normalized message to all connected frontend clients
            this.io.emit('chat_message', normalizedMsg);
            console.log(`[Twitch] ${normalizedMsg.user}: ${normalizedMsg.message}`);
        });
    }

    async connect() {
        return new Promise((resolve, reject) => {
            const db = require('../db/database');
            db.get("SELECT access_token FROM tokens WHERE platform = 'twitch'", async (err, row) => {
                if (err || !row) {
                    console.warn('[Twitch] No OAuth token found in DB. Connect via the Dashboard first.');
                    return resolve(false);
                }

                try {
                    // First validate the token to get the username
                    const axios = require('axios');
                    const validateRes = await axios.get('https://id.twitch.tv/oauth2/validate', {
                        headers: { 'Authorization': `OAuth ${row.access_token}` }
                    });

                    this.username = validateRes.data.login;
                    console.log(`[Twitch] Token valid for user: ${this.username}`);

                    // Connect to IRC
                    this.client = new tmi.Client({
                        options: { debug: false },
                        identity: {
                            username: this.username,
                            password: `oauth:${row.access_token}`
                        },
                        channels: [this.username]
                    });

                    this.setupListeners();
                    await this.client.connect();
                    console.log(`[Twitch] Successfully joined channel: #${this.username}`);
                    resolve(true);
                } catch (error) {
                    console.error('[Twitch] Connection or validation failed:', error.response?.data || error.message);
                    reject(error);
                }
            });
        });
    }

    disconnect() {
        this.client.disconnect();
        console.log('[Twitch] Disconnected.');
    }

    // Placeholder for moderation reverse-actions
    timeout(channel, user, duration) {
        console.log(`[Twitch] Mock timeout for ${user} in ${channel} for ${duration}s`);
    }
}

module.exports = TwitchManager;
