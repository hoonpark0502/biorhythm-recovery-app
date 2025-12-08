import React from 'react';
import { StorageProvider, useStorage } from './context/StorageContext';
import { AuthProvider } from './context/AuthContext';
import { db, auth } from './firebase';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import DailyCheck from './pages/DailyCheck';
import ReliefFlow from './pages/ReliefFlow';
import Garden from './pages/Garden';
import Stats from './pages/Stats';
import './index.css';



function AppContent() {
    const { profile } = useStorage();
    const [currentView, setCurrentView] = React.useState('home');

    // CRITICAL: Check Configuration
    if (!db || !auth) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1 style={{ color: 'red' }}>Configuration Error</h1>
                <p>Firebase is not initialized.</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                    Please check Vercel Environment Variables.<br />
                    (VITE_FIREBASE_API_KEY is missing)
                </p>
            </div>
        );
    }

    // If not onboarded, force Onboarding
    if (!profile.isOnboarded) {
        return <Onboarding />;
    }

    // Simple Router
    const renderView = () => {
        switch (currentView) {
            case 'home': return <Home onNavigate={setCurrentView} />;
            case 'dailyCheck': return <DailyCheck onBack={() => setCurrentView('home')} />;
            case 'relief': return <ReliefFlow onExit={() => setCurrentView('home')} />;
            case 'garden': return <Garden onBack={() => setCurrentView('home')} />;
            case 'stats': return <Stats onBack={() => setCurrentView('home')} />;
            default: return <Home onNavigate={setCurrentView} />;
        }
    };

    return (
        <div className="app-container">
            {renderView()}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <StorageProvider>
                <AppContent />
            </StorageProvider>
        </AuthProvider>
    );
}

export default App;
