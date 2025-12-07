import React from 'react';
import { StorageProvider, useStorage } from './context/StorageContext';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import DailyCheck from './pages/DailyCheck';
import ReliefFlow from './pages/ReliefFlow';

function AppContent() {
    const { profile } = useStorage();
    const [currentView, setCurrentView] = React.useState('home');

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
        <StorageProvider>
            <AppContent />
        </StorageProvider>
    );
}

export default App;
