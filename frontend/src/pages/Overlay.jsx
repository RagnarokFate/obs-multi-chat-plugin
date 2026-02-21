import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const Overlay = () => {
    const [messages, setMessages] = useState([]);
    const [settings, setSettings] = useState({ maxMessages: 50, showPlatformIcons: true });
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Add transparent-mode class to body for OBS
        document.body.classList.add('transparent-mode');

        // Fetch settings
        fetch('http://localhost:3000/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data) setSettings({ maxMessages: data.maxMessages, showPlatformIcons: data.showPlatformIcons === 1 });
            })
            .catch(console.error);

        // Connect to Backend WebSocket
        const socket = io('http://localhost:3000');

        socket.on('chat_message', (msg) => {
            setMessages(prev => {
                const newArr = [...prev, msg];
                // Hard constraint on memory usage for OBS DOM
                if (newArr.length > settings.maxMessages) {
                    return newArr.slice(newArr.length - settings.maxMessages);
                }
                return newArr;
            });

            // Smooth auto-scroll to bottom behavior
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        });

        return () => {
            document.body.classList.remove('transparent-mode');
            socket.disconnect();
        };
    }, [settings.maxMessages]);

    const getPlatformColors = (platform) => {
        switch (platform) {
            case 'twitch': return { name: 'text-purple-400' };
            case 'youtube': return { name: 'text-red-500' };
            case 'kick': return { name: 'text-green-400' };
            default: return { name: 'text-white' };
        }
    };

    return (
        <div className="w-full h-screen overflow-hidden no-scrollbar p-4 flex flex-col justify-end">
            <div className="flex flex-col gap-2">
                {messages.map((msg, idx) => {
                    const colors = getPlatformColors(msg.platform);
                    const isHighlight = msg.type === 'highlight' || msg.type === 'superchat';

                    // Parse timestamp into HH:MM:SS
                    const timeString = new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false // Force 24-hour format if desired, or let local dictate
                    });

                    return (
                        <div
                            key={msg.id || idx}
                            className={`flex items-start gap-2 max-w-[400px] animate-fade-in-up transition-all ${isHighlight ? 'transform scale-[1.02]' : ''}`}
                            style={{
                                animation: 'fade-in-up 0.3s ease-out forwards',
                                filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8)) drop-shadow(0px 0px 4px rgba(0,0,0,0.6))'
                            }}
                        >
                            {/* Inline Wrapper */}
                            <div className="leading-snug break-words w-full">
                                <span className="inline-block mr-2 font-bold text-[11px] text-slate-400 opacity-80 tracking-widest translate-y-[-1px]">
                                    {timeString}
                                </span>

                                {settings.showPlatformIcons && (
                                    <span className={`inline-block mr-1.5 font-bold text-[10px] uppercase px-1 py-0.5 rounded bg-black/60 translate-y-[-1px] ${colors.name}`}>
                                        {msg.platform}
                                    </span>
                                )}
                                <span className={`font-bold text-[15px] ${colors.name}`}>
                                    {msg.user}
                                </span>
                                <span className="text-white font-bold mx-1">:</span>

                                {msg.type === 'superchat' && (
                                    <span className="font-bold text-green-400 text-sm mr-2 bg-black/40 px-1 rounded">
                                        ${msg.metadata?.amountMicros / 1000000}
                                    </span>
                                )}

                                <span className={`text-[15px] ${msg.type === 'highlight' ? 'font-bold text-yellow-300 italic' : 'font-medium text-slate-100'}`}>
                                    {msg.message}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default Overlay;
