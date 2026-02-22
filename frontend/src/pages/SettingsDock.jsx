import React, { useEffect, useState } from 'react';

const SettingsDock = () => {
    const [settings, setSettings] = useState({
        maxMessages: 50,
        showPlatformIcons: true,
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontFamily: 'Inter',
        textWrap: true
    });

    useEffect(() => {
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
            .catch(console.error);
    }, []);

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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-primary border-b border-slate-800 pb-2">Multi-Chat Setup</h2>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-6">
                <h3 className="text-sm font-bold mb-3 text-slate-300">Connections</h3>
                <ul className="space-y-2">
                    <li className="flex justify-between items-center p-2 bg-slate-800/50 rounded border border-slate-700/50">
                        <span className="font-bold text-sm text-purple-400">Twitch</span>
                        <button
                            onClick={() => {
                                const win = window.open('http://localhost:3000/auth/twitch', '_blank', 'width=500,height=600');
                                const timer = setInterval(() => {
                                    if (win && win.closed) {
                                        clearInterval(timer);
                                        fetch('http://localhost:3000/api/refresh-connections')
                                            .then(() => alert("Twitch Authenticated!"))
                                            .catch(console.error);
                                    }
                                }, 500);
                            }}
                            className="text-[11px] bg-purple-600 hover:bg-purple-500 font-bold px-2 py-1 rounded transition-colors"
                        >Connect</button>
                    </li>
                    <li className="flex justify-between items-center p-2 bg-slate-800/50 rounded border border-slate-700/50">
                        <span className="font-bold text-sm text-red-500">YouTube</span>
                        <button
                            onClick={() => {
                                const win = window.open('http://localhost:3000/auth/youtube', '_blank', 'width=500,height=600');
                                const timer = setInterval(() => {
                                    if (win && win.closed) {
                                        clearInterval(timer);
                                        fetch('http://localhost:3000/api/refresh-connections')
                                            .then(() => alert("YouTube Authenticated!"))
                                            .catch(console.error);
                                    }
                                }, 500);
                            }}
                            className="text-[11px] bg-red-600 hover:bg-red-500 font-bold px-2 py-1 rounded transition-colors"
                        >Connect</button>
                    </li>
                    <li className="flex justify-between items-center p-2 bg-slate-800/50 rounded border border-slate-700/50">
                        <span className="font-bold text-sm text-green-400">Kick</span>
                        <a href="http://localhost:3000/auth/kick" target="_blank" className="text-[11px] bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded">Test</a>
                    </li>
                </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <h3 className="text-sm font-bold mb-3 text-slate-300">Overlay Aesthetics</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Max Messages ({settings.maxMessages})</label>
                        <input
                            type="range" min="5" max="200"
                            value={settings.maxMessages}
                            onChange={(e) => setSettings({ ...settings, maxMessages: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Font Family</label>
                            <select
                                value={settings.fontFamily}
                                onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                                className="w-full bg-slate-800 text-xs p-1 rounded border border-slate-700 focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="Inter">Inter</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Outfit">Outfit</option>
                                <option value="monospace">Mono</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Size ({settings.fontSize}px)</label>
                            <input
                                type="range" min="10" max="36"
                                value={settings.fontSize}
                                onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <label className="flex-1 flex justify-center items-center gap-1 text-xs bg-slate-800/50 py-1.5 rounded border border-slate-700/50 cursor-pointer hover:bg-slate-700 transition">
                            <input
                                type="checkbox"
                                checked={settings.fontWeight === 'bold'}
                                onChange={(e) => setSettings({ ...settings, fontWeight: e.target.checked ? 'bold' : 'normal' })}
                                className="hidden"
                            />
                            <strong className={settings.fontWeight === 'bold' ? 'text-primary' : 'text-slate-400'}>Bold</strong>
                        </label>
                        <label className="flex-1 flex justify-center items-center gap-1 text-xs bg-slate-800/50 py-1.5 rounded border border-slate-700/50 cursor-pointer hover:bg-slate-700 transition">
                            <input
                                type="checkbox"
                                checked={settings.fontStyle === 'italic'}
                                onChange={(e) => setSettings({ ...settings, fontStyle: e.target.checked ? 'italic' : 'normal' })}
                                className="hidden"
                            />
                            <em className={settings.fontStyle === 'italic' ? 'text-primary' : 'text-slate-400'}>Italic</em>
                        </label>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.showPlatformIcons}
                                onChange={(e) => setSettings({ ...settings, showPlatformIcons: e.target.checked })}
                                className="rounded bg-slate-800 border-slate-700 text-primary w-3 h-3"
                            />
                            Platform Icons
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.textWrap}
                                onChange={(e) => setSettings({ ...settings, textWrap: e.target.checked })}
                                className="rounded bg-slate-800 border-slate-700 text-primary w-3 h-3"
                            />
                            Text Wrapping
                        </label>
                    </div>
                </div>
                <button
                    onClick={saveSettings}
                    className="w-full mt-4 bg-primary hover:bg-blue-600 text-white font-medium py-1.5 text-sm rounded transition-colors">
                    Save
                </button>
            </div>
        </div>
    );
};

export default SettingsDock;
