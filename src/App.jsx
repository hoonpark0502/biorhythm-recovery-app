import React from 'react';
import { StorageProvider, useStorage } from './context/StorageContext';
import { AuthProvider } from './context/AuthContext';
import { db, auth } from './firebase';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import DailyCheck from './pages/DailyCheck';
import ReliefFlow from './pages/ReliefFlow';
import Stats from './pages/Stats';
import UpdateNotifier from './components/UpdateNotifier';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Lazy load Garden (Heavy 3D)
const Garden = React.lazy(() => import('./pages/Garden'));

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
            case 'garden': return (
                <ErrorBoundary>
                    <React.Suspense fallback={<div style={{ padding: '20px' }}>Loading Garden...</div>}>
                        <Garden onBack={() => setCurrentView('home')} />
                    </React.Suspense>
                </ErrorBoundary>
            );
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
                <UpdateNotifier />
            </StorageProvider>
        </AuthProvider>
    );
}

export default App;
