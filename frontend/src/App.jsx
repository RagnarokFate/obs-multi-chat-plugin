import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Overlay from './pages/Overlay';
import ChatDock from './pages/ChatDock';
import SettingsDock from './pages/SettingsDock';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/overlay" element={<Overlay />} />
                <Route path="/chat-dock" element={<ChatDock />} />
                <Route path="/settings-dock" element={<SettingsDock />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
