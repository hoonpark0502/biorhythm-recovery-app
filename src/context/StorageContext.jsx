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
    notificationTime: { morning: '08:00', evening: '20:00' },
    tokens: 0,
    dailyRoutineCount: 0,
    lastRoutineDate: ''
};

export function StorageProvider({ children }) {
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
        return saved ? JSON.parse(saved) : initialProfile;
    });

    const [logs, setLogs] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
        return saved ? JSON.parse(saved) : {};
    });

    const [todayRoutine, setTodayRoutine] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.ROUTINE);
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

        // 1. Mark routine as completed in state
        const updated = { ...todayRoutine, completed: true };
        setTodayRoutine(updated);

        // 2. Log in history
        const today = new Date().toISOString().split('T')[0];
        setLogs(prev => ({
            ...prev,
            [today]: { ...prev[today], routineCompleted: true }
        }));

        // 3. Update Token Logic
        setProfile(prev => {
            const lastDate = prev.lastRoutineDate || "";
            let newDailyCount = prev.dailyRoutineCount || 0;
            let newTokens = prev.tokens || 0;

            // Reset count if new day
            if (lastDate !== today) {
                newDailyCount = 0;
            }

            newDailyCount += 1;

            // Rule: 1 Token per 5 routines. Max 10 tokens per day.
            // We assume 'tokens gained today' needs tracking, but implementing simple global cap or implicit logic
            // Implicit: If newDailyCount is 5, 10, ... 50, award token.
            if (newDailyCount <= 50 && newDailyCount % 5 === 0) {
                newTokens += 1;
                alert("✨ You earned a Golden Token! ✨"); // Simple feedback
            }

            return {
                ...prev,
                dailyRoutineCount: newDailyCount,
                tokens: newTokens,
                lastRoutineDate: today
            };
        });
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
