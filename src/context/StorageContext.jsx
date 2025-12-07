import React, { createContext, useContext, useState, useEffect } from 'react';

const StorageContext = createContext();

const STORAGE_KEYS = {
    PROFILE: 'bio_profile',
    LOGS: 'bio_logs',
    ROUTINE: 'bio_today_routine',
};

// Initial State
const initialProfile = {
    name: '',
    isOnboarded: false,
    notificationTime: { morning: '08:00', evening: '20:00' }
};

export function StorageProvider({ children }) {
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
        return saved ? JSON.parse(saved) : initialProfile;
    });

    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
        return saved ? JSON.parse(saved) : {}; // Object keyed by "YYYY-MM-DD"
    });

    const [todayRoutine, setTodayRoutine] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.ROUTINE);
        // Logic to reset routine if date changed could go here, 
        // but for MVP we load what's there and App checks date
        return saved ? JSON.parse(saved) : null;
    });

    // Persist effects
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }, [profile]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    }, [logs]);

    useEffect(() => {
        if (todayRoutine) {
            localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(todayRoutine));
        }
    }, [todayRoutine]);

    // Actions
    const updateProfile = (updates) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const completeOnboarding = (name) => {
        updateProfile({ name, isOnboarded: true });
    };

    const saveDailyLog = (data) => {
        const today = new Date().toISOString().split('T')[0];
        setLogs(prev => ({
            ...prev,
            [today]: { ...prev[today], ...data, timestamp: Date.now() }
        }));
    };

    const getTodayLog = () => {
        const today = new Date().toISOString().split('T')[0];
        return logs[today] || null;
    };

    const setRoutine = (routineData) => {
        setTodayRoutine(routineData);
    }

    const completeRoutine = () => {
        if (!todayRoutine) return;
        const updated = { ...todayRoutine, completed: true };
        setTodayRoutine(updated);

        // Also log it in history
        const today = new Date().toISOString().split('T')[0];
        setLogs(prev => ({
            ...prev,
            [today]: { ...prev[today], routineCompleted: true }
        }));
    }

    return (
        <StorageContext.Provider value={{
            profile,
            logs,
            todayRoutine,
            updateProfile,
            completeOnboarding,
            saveDailyLog,
            getTodayLog,
            setRoutine,
            completeRoutine
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    return useContext(StorageContext);
}
