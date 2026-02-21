const Pusher = require('pusher-js');
const { normalizeKick } = require('../normalizer');

class KickManager {
    constructor(io, channelId) {
        this.io = io;
        this.channelId = channelId;
        this.pusher = null;
        this.channel = null;
    }

    async connect() {
        if (!this.channelId) {
            console.warn('[Kick] Missing Channel ID. Cannot connect.');
            return;
        }

        try {
            // Initialize Pusher specifically for Kick's cluster
            this.pusher = new Pusher('eb1d5f283081a78b932c', {
                wsHost: 'ws-us2.pusher.com',
                wsPort: 443,
                forceTLS: true,
                disableStats: true,
                cluster: 'us2',
                enabledTransports: ['ws', 'wss']
            });

            this.pusher.connection.bind('connected', () => {
                console.log('[Kick] Connected to Pusher WebSocket.');
            });

            this.pusher.connection.bind('error', (err) => {
                console.error('[Kick] Pusher error:', err);
            });

            // Subscribe to the channel's chatroom
            this.channel = this.pusher.subscribe(`chatrooms.${this.channelId}.v2`);

            // Bind to the App\\Events\\ChatMessageEvent
            this.channel.bind('App\\Events\\ChatMessageEvent', (data) => {
                if (!data) return;

                const normalizedMsg = normalizeKick(data);
                this.io.emit('chat_message', normalizedMsg);
                console.log(`[Kick] ${normalizedMsg.user}: ${normalizedMsg.message}`);
            });

        } catch (error) {
            console.error('[Kick] Connection failed:', error);
        }
    }

    disconnect() {
        if (this.pusher && this.channelId) {
            this.pusher.unsubscribe(`chatrooms.${this.channelId}.v2`);
            this.pusher.disconnect();
        }
        console.log('[Kick] Disconnected.');
    }

    // Kick has no public official moderation API yet, mock only
    timeout(userId, duration) {
        console.log(`[Kick] Mock timeout for user ${userId} for ${duration}s`);
    }
}

module.exports = KickManager;
