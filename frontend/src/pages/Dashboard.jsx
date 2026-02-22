import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const Dashboard = () => {
    const [messages, setMessages] = useState([]);
    const [settings, setSettings] = useState({
        maxMessages: 50,
        showPlatformIcons: true,
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontFamily: 'Inter',
        textWrap: true
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
                if (data) setSettings({
                    maxMessages: data.maxMessages,
                    showPlatformIcons: data.showPlatformIcons === 1,
                    fontSize: data.fontSize || 14,
                    fontWeight: data.fontWeight || 'normal',
                    fontStyle: data.fontStyle || 'normal',
                    fontFamily: data.fontFamily || 'Inter',
                    textWrap: data.textWrap !== 0
                });
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
                // Enforce max messages limit immediately in Dashboard
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
            console.log(`Sent ${action} request for ${platform}`);
        } catch (err) {
            console.error("Moderation action failed", err);
        }
    };

    const saveSettings = async () => {
        try {
            await fetch('http://localhost:3000/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maxMessages: settings.maxMessages,
                    showPlatformIcons: settings.showPlatformIcons,
                    fontSize: settings.fontSize,
                    fontWeight: settings.fontWeight,
                    fontStyle: settings.fontStyle,
                    fontFamily: settings.fontFamily,
                    textWrap: settings.textWrap
                })
            });
            alert("Settings Saved!");
        } catch (err) {
            console.error("Failed to save settings", err);
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
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <header className="mb-8 border-b border-slate-800 pb-4 flex flex-col lg:flex-row justify-between lg:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Multi-Chat Dashboard</h1>
                    <p className="text-slate-400">Manage chat from Twitch, YouTube, and Kick.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/chat-dock`);
                            alert("Chat Dock URL Copied!");
                        }}
                        className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                    >
                        📋 Copy Chat Dock URL
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/settings-dock`);
                            alert("Settings Dock URL Copied!");
                        }}
                        className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                    >
                        📋 Copy Settings Dock URL
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chat Stream View */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[70vh]">
                    <div className="p-4 bg-slate-800/50 border-b border-slate-800 font-semibold flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span>Live Chat</span>
                            <button
                                onClick={() => handleModeration('system', 'clear_chat')}
                                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-red-400 border border-slate-700 transition-colors"
                            >
                                Clear Chat
                            </button>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isConnected ? 'Connected to Backend' : 'Disconnected'}
                        </span>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {messages.length === 0 ? (
                            <div className="text-slate-500 italic text-center mt-10">Waiting for messages...</div>
                        ) : (
                            messages.map((msg, idx) => {
                                const colors = getPlatformColors(msg.platform);
                                const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <div key={msg.id || idx} className="flex items-start gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition-colors group">
                                        {settings.showPlatformIcons && (
                                            <div className={`flex-shrink-0 w-8 h-8 ${colors.bg} rounded flex items-center justify-center font-bold text-sm text-white uppercase`}>
                                                {msg.platform.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className={`font-bold ${colors.text}`}>
                                                    {msg.user}
                                                    {msg.type === 'highlight' && <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-500 px-1 rounded">Highlight</span>}
                                                    {msg.type === 'superchat' && <span className="ml-2 text-xs bg-green-500/20 text-green-500 px-1 rounded">${msg.metadata?.amountMicros / 1000000}</span>}
                                                </span>
                                                <span className="text-xs text-slate-500">{time}</span>
                                            </div>
                                            <p className="text-slate-300 break-words">{msg.message}</p>
                                        </div>

                                        {/* Moderation Controls (visible on hover) */}
                                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 self-start bg-slate-950 p-1 rounded shadow-lg border border-slate-700 transition-opacity">
                                            <button onClick={() => handleModeration(msg.platform, 'timeout', { user: msg.user, duration: 600 })} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300">Timeout 10m</button>
                                            <button onClick={() => handleModeration(msg.platform, 'ban', { user: msg.user })} className="text-xs bg-destructive/20 hover:bg-destructive/40 text-destructive px-2 py-1 rounded">Ban</button>
                                            <button onClick={() => handleModeration(msg.platform, 'delete', { messageId: msg.id })} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300">Delete</button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar / Settings Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 h-[70vh] overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Platform Configs</h2>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <span className="font-bold text-purple-400">Twitch</span>
                                <button
                                    onClick={() => {
                                        const win = window.open('http://localhost:3000/auth/twitch', '_blank', 'width=500,height=600');
                                        const timer = setInterval(() => {
                                            if (win && win.closed) {
                                                clearInterval(timer);
                                                fetch('http://localhost:3000/api/refresh-connections')
                                                    .then(() => alert("Twitch Authenticated and Connected!"))
                                                    .catch(console.error);
                                            }
                                        }, 500);
                                    }}
                                    className="text-xs bg-purple-600 hover:bg-purple-500 font-bold px-3 py-1.5 rounded transition-colors"
                                >Connect</button>
                            </li>
                            <li className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <span className="font-semibold text-red-500">YouTube</span>
                                <button
                                    onClick={() => {
                                        const win = window.open('http://localhost:3000/auth/youtube', '_blank', 'width=500,height=600');
                                        const timer = setInterval(() => {
                                            if (win && win.closed) {
                                                clearInterval(timer);
                                                fetch('http://localhost:3000/api/refresh-connections')
                                                    .then(() => alert("YouTube Authenticated! Make sure you are live to ingest chat."))
                                                    .catch(console.error);
                                            }
                                        }, 500);
                                    }}
                                    className="text-xs bg-red-600 hover:bg-red-500 font-bold px-3 py-1.5 rounded transition-colors"
                                >Connect</button>
                            </li>
                            <li className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <span className="font-semibold text-green-400">Kick</span>
                                <a href="http://localhost:3000/auth/kick" className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded">Connect</a>
                            </li>
                        </ul>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <h2 className="text-xl font-bold mb-4">Overlay Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Max Messages on Overlay ({settings.maxMessages})</label>
                                <input
                                    type="range" min="5" max="200"
                                    value={settings.maxMessages}
                                    onChange={(e) => setSettings({ ...settings, maxMessages: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>5</span>
                                    <span>Performance Limit</span>
                                    <span>200</span>
                                </div>
                            </div>

                            <hr className="border-slate-800 my-2" />
                            <h3 className="text-sm font-bold text-slate-300">Typography Settings</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Font Family</label>
                                    <select
                                        value={settings.fontFamily}
                                        onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                                        className="w-full bg-slate-800 text-sm p-1.5 rounded border border-slate-700 focus:ring-1 focus:ring-primary outline-none"
                                    >
                                        <option value="Inter">Inter (Sans)</option>
                                        <option value="Roboto">Roboto</option>
                                        <option value="Outfit">Outfit</option>
                                        <option value="monospace">Monospace</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Font Size ({settings.fontSize}px)</label>
                                    <input
                                        type="range" min="10" max="36"
                                        value={settings.fontSize}
                                        onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                                        className="w-full mt-1"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                                <label className="flex items-center gap-2 text-sm bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 cursor-pointer hover:bg-slate-700 transition">
                                    <input
                                        type="checkbox"
                                        checked={settings.fontWeight === 'bold'}
                                        onChange={(e) => setSettings({ ...settings, fontWeight: e.target.checked ? 'bold' : 'normal' })}
                                        className="rounded bg-slate-900 border-slate-700 text-primary"
                                    />
                                    <strong>Bold</strong>
                                </label>
                                <label className="flex items-center gap-2 text-sm bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 cursor-pointer hover:bg-slate-700 transition">
                                    <input
                                        type="checkbox"
                                        checked={settings.fontStyle === 'italic'}
                                        onChange={(e) => setSettings({ ...settings, fontStyle: e.target.checked ? 'italic' : 'normal' })}
                                        className="rounded bg-slate-900 border-slate-700 text-primary"
                                    />
                                    <em>Italic</em>
                                </label>
                            </div>

                            <hr className="border-slate-800 my-2" />

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.showPlatformIcons}
                                        onChange={(e) => setSettings({ ...settings, showPlatformIcons: e.target.checked })}
                                        className="rounded bg-slate-800 border-slate-700 text-primary focus:ring-primary"
                                    />
                                    Show Platform Icons in Overlay
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.textWrap}
                                        onChange={(e) => setSettings({ ...settings, textWrap: e.target.checked })}
                                        className="rounded bg-slate-800 border-slate-700 text-primary focus:ring-primary"
                                    />
                                    Enable Text Wrapping
                                </label>
                            </div>
                        </div>
                        <button
                            onClick={saveSettings}
                            className="w-full mt-6 bg-primary hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
