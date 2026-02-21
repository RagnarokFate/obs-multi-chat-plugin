const axios = require('axios');
const { normalizeYouTube } = require('../normalizer');

class YouTubeManager {
    constructor(io) {
        this.io = io;
        this.liveChatId = null;
        this.nextPageToken = '';
        this.pollingInterval = null;
        this.isPolling = false;
        this.accessToken = null;
    }

    async connect() {

        return new Promise((resolve, reject) => {
            const db = require('../db/database');
            db.get("SELECT access_token FROM tokens WHERE platform = 'youtube'", async (err, row) => {
                if (err || !row) {
                    console.warn('[YouTube] No OAuth token found in DB. Connect via the Dashboard first.');
                    return resolve(false);
                }

                this.accessToken = row.access_token;

                try {
                    // Automatically find the user's active live broadcast to get the liveChatId
                    const broadcastRes = await axios.get('https://www.googleapis.com/youtube/v3/liveBroadcasts', {
                        params: {
                            part: 'snippet',
                            broadcastStatus: 'active',
                            broadcastType: 'all'
                        },
                        headers: { 'Authorization': `Bearer ${this.accessToken}` }
                    });

                    const activeBroadcast = broadcastRes.data.items?.[0];

                    if (!activeBroadcast || !activeBroadcast.snippet.liveChatId) {
                        console.warn('[YouTube] No active live broadcasts found for this account right now.');
                        return resolve(false);
                    }

                    this.liveChatId = activeBroadcast.snippet.liveChatId;
                    console.log(`[YouTube] Connected to Broadcast: ${activeBroadcast.snippet.title}. Active LiveChatID: ${this.liveChatId}`);

                    // Start Polling
                    this.startPolling();
                    resolve(true);
                } catch (error) {
                    console.error('[YouTube] Connection failed. Token expired or API error:', error.response?.data?.error?.message || error.message);
                    reject(error);
                }
            });
        });
    }

    async fetchChat() {
        if (this.isPolling || !this.liveChatId) return;
        this.isPolling = true;

        try {
            const res = await axios.get('https://www.googleapis.com/youtube/v3/liveChat/messages', {
                params: {
                    liveChatId: this.liveChatId,
                    part: 'snippet,authorDetails',
                    maxResults: 200,
                    pageToken: this.nextPageToken || undefined
                },
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });

            const data = res.data;

            // Calculate next polling interval based on YouTube's quota suggestions
            const delayMs = data.pollingIntervalMillis || 5000;
            this.nextPageToken = data.nextPageToken;

            const items = data.items || [];

            // Process new messages
            if (items.length > 0 && this.nextPageToken) {
                items.forEach(item => {
                    const normalizedMsg = normalizeYouTube(item);
                    this.io.emit('chat_message', normalizedMsg);
                    console.log(`[YouTube] ${normalizedMsg.user}: ${normalizedMsg.message}`);
                });
            }

            // Schedule next poll
            this.pollingInterval = setTimeout(() => this.fetchChat(), delayMs);

        } catch (error) {
            console.error('[YouTube] Fetch failed:', error.response?.data || error.message);
            // Fallback delay on error to avoid quota burn
            this.pollingInterval = setTimeout(() => this.fetchChat(), 10000);
        } finally {
            this.isPolling = false;
        }
    }

    startPolling() {
        console.log('[YouTube] Starting chat poll loop.');
        this.fetchChat();
    }

    disconnect() {
        if (this.pollingInterval) {
            clearTimeout(this.pollingInterval);
        }
        console.log('[YouTube] Disconnected.');
    }

    deleteMessage(messageId) {
        console.log(`[YouTube] Mock message delete for message ID: ${messageId}`);
    }
}

module.exports = YouTubeManager;
