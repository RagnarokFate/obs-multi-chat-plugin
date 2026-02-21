const { io } = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

const socket = io('http://localhost:3000');

const platforms = ['twitch', 'youtube', 'kick'];
const types = ['chat', 'superchat', 'highlight'];

socket.on('connect', () => {
    console.log('Test Client Connected. Starting high-traffic mock (50 msg/sec)...');

    // 50 messages per second = 1 message every 20ms
    setInterval(() => {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const amount = type === 'superchat' ? Math.floor(Math.random() * 50000000) : null;

        // This simulates the structural payload expected by the frontend (already normalized)
        // Normally the backend emits this, but for the sake of the test, we'll force the backend to broadcast it
        // by creating a hidden dev-only route or just sending it directly to frontend locally.

        // Let's actually use a custom test event the backend will broadcast
        socket.emit('test_inject_message', {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            platform: platform,
            user: `TestUser_${Math.floor(Math.random() * 1000)}`,
            message: `Mock message ${uuidv4()} - High velocity test sequence.`,
            type: type,
            metadata: {
                amountMicros: amount
            }
        });

    }, 20); // 20ms = ~50 msgs/sec
});

socket.on('disconnect', () => {
    console.log('Test Client Disconnected.');
});
