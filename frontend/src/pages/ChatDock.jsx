import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const ChatDock = () => {
    const [messages, setMessages] = useState([]);
    const [settings, setSettings] = useState({
        maxMessages: 50,
        showPlatformIcons: true,
    });
    const [isConnected, setIsConnected] = useState(false);
    const scrollRef = useRef(null);
    const maxMessagesRef = useRef(settings.maxMessages);

    // Keep ref in sync without triggering useEffect reconnection
    useEffect(() => {
        maxMessagesRef.current = settings.maxMessages;
    }, [settings.maxMessages]);

    useEffect(() => {
        // Fetch initial settings from API
        fetch('http://localhost:3000/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data) setSettings({ maxMessages: data.maxMessages, showPlatformIcons: data.showPlatformIcons === 1 });
            })
            .catch(err => console.error("Error fetching settings:", err));

        // Connect to WebSocket Server
        const socket = io('http://localhost:3000');

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('chat_message', (msg) => {
            setMessages(prev => {
                const newArr = [...prev, msg];
                const limit = maxMessagesRef.current;
                if (newArr.length > limit) {
                    return newArr.slice(newArr.length - limit);
                }
                return newArr;
            });

            // Auto-scroll logic
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 50);
        });

        socket.on('clear_chat', () => {
            setMessages([]);
        });

        return () => socket.disconnect();
    }, []);

    const handleModeration = async (platform, action, payload) => {
        try {
            await fetch('http://localhost:3000/api/moderate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ platform, action, payload })
            });
        } catch (err) {
            console.error("Moderation action failed", err);
        }
    };

    const getPlatformColors = (platform) => {
        switch (platform) {
            case 'twitch': return { bg: 'bg-purple-600', text: 'text-purple-400' };
            case 'youtube': return { bg: 'bg-red-600', text: 'text-red-400' };
            case 'kick': return { bg: 'bg-green-500', text: 'text-green-400' };
            default: return { bg: 'bg-slate-600', text: 'text-slate-400' };
        }
    };

    return (
        <div className="h-screen bg-slate-950 text-slate-100 flex flex-col p-1">
            <div className="p-3 bg-slate-900 border-b border-slate-800 font-semibold flex justify-between items-center rounded-t-lg">
                <div className="flex items-center gap-2">
                    <span className="text-sm">Live Chat</span>
                    <button
                        onClick={() => handleModeration('system', 'clear_chat')}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-red-400 border border-slate-700 transition-colors"
                    >
                        Clear
                    </button>
                </div>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 bg-slate-900 border-x border-b border-slate-800 rounded-b-lg">
                {messages.length === 0 ? (
                    <div className="text-slate-500 italic text-center text-xs mt-10">Waiting for messages...</div>
                ) : (
                    messages.map((msg, idx) => {
                        const colors = getPlatformColors(msg.platform);
                        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={msg.id || idx} className="flex items-start gap-2 p-2 hover:bg-slate-800/80 rounded transition-colors group">
                                {settings.showPlatformIcons && (
                                    <div className={`flex-shrink-0 w-6 h-6 ${colors.bg} rounded flex items-center justify-center font-bold text-[10px] text-white uppercase mt-0.5`}>
                                        {msg.platform.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className={`font-bold text-sm truncate pr-2 ${colors.text}`}>
                                            {msg.user}
                                        </span>
                                        <span className="text-[10px] text-slate-500 flex-shrink-0">{time}</span>
                                    </div>
                                    <p className="text-slate-300 text-sm break-words">{msg.message}</p>
                                </div>

                                {/* Dock Moderation Controls */}
                                <div className="hidden group-hover:flex flex-col gap-1 self-start ml-1">
                                    <button onClick={() => handleModeration(msg.platform, 'timeout', { user: msg.user, duration: 600 })} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300" title="Timeout 10m">⌚</button>
                                    <button onClick={() => handleModeration(msg.platform, 'ban', { user: msg.user })} className="text-[10px] bg-destructive/20 hover:bg-destructive/40 text-destructive px-1.5 py-0.5 rounded" title="Ban">🔨</button>
                                    <button onClick={() => handleModeration(msg.platform, 'delete', { messageId: msg.id })} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded text-slate-300" title="Delete">🗑️</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatDock;
