require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./src/db/database');

const TwitchManager = require('./src/platforms/twitch');
const YouTubeManager = require('./src/platforms/youtube');
const KickManager = require('./src/platforms/kick');

const twitchAuthResult = require('./src/auth/twitchAuth');
const youtubeAuthResult = require('./src/auth/youtubeAuth');

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend requests
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Platform Manager Instances
const twitchManager = new TwitchManager(io);
const youtubeManager = new YouTubeManager(io);
const kickManager = new KickManager(io, process.env.KICK_CHANNEL);

// Initialize Connections on Startup
twitchManager.connect();
youtubeManager.connect();
if (process.env.KICK_CHANNEL && process.env.KICK_CHANNEL !== "your_kick_channel_name") {
    kickManager.connect();
}

// Basic multiplexing endpoint for Socket.io
io.on('connection', (socket) => {
    console.log('Client connected to WebSocket:', socket.id);

    // Send an initial mock payload when client connects
    socket.emit('chat_message', {
        id: `mock-${Date.now()}`,
        timestamp: new Date().toISOString(),
        platform: 'twitch',
        user: 'System',
        message: 'Backend connection established!',
        type: 'system',
        metadata: {}
    });

    // Development/testing route for load script injection
    socket.on('test_inject_message', (msg) => {
        io.emit('chat_message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Simple API route to get settings
app.get('/api/settings', (req, res) => {
    db.get("SELECT * FROM settings WHERE id = 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.post('/api/settings', (req, res) => {
    const { maxMessages, showPlatformIcons } = req.body;
    db.run("UPDATE settings SET maxMessages = ?, showPlatformIcons = ? WHERE id = 1",
        [maxMessages, showPlatformIcons],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// Mount Authentication Routes
app.use('/auth/twitch', twitchAuthResult);
app.use('/auth/youtube', youtubeAuthResult);

// Special internal route to tell the platforms to attempt reconnect after auth
app.get('/api/refresh-connections', async (req, res) => {
    console.log('[System] Attempting to reconnect platform managers using latest DB tokens...');
    twitchManager.disconnect();
    await twitchManager.connect();

    youtubeManager.disconnect();
    await youtubeManager.connect();

    res.json({ success: true, message: "Reconnection triggered." });
});

app.get('/auth/kick', (req, res) => {
    res.send("<h2>Kick 'Authentication' Configured!</h2><p>Kick doesn't currently require standard OAuth. We use the KICK_CHANNEL defined in your .env file.</p><script>setTimeout(() => window.close(), 3000);</script>");
});

// Moderation Action execution route
app.post('/api/moderate', (req, res) => {
    const { platform, action, payload } = req.body;
    console.log(`[Moderation] Route hit for ${platform} - action: ${action}`);

    // Switch on platform to execute action...
    if (platform === 'twitch') twitchManager.timeout(payload.channel, payload.user, payload.duration || 600);

    res.json({ success: true, message: `Mock ${action} executed on ${platform}` });
});

// Serve frontend static assets for Production Release
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all route to hand over routing to React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Multi-Chat Backend running on port ${PORT}`);
});
