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

            // Rule: 0.2 Tokens per routine (Immediate Feedback)
            const earned = 0.2;
            newTokens = (parseFloat(newTokens) + earned).toFixed(1); // Keep decimal precision

            // alert(`✨ Well done! +${earned} Token`); // Optional: less intrusive toast is better, but alert works for MVP

            return {
                ...prev,
                dailyRoutineCount: newDailyCount,
                tokens: parseFloat(newTokens), // Store as number
                lastRoutineDate: today
            };
        });
    }

    const refreshRoutine = (isPaid) => {
        const NOW = Date.now();
        const COOLDOWN = 60 * 60 * 1000; // 1 Hour

        if (isPaid) {
            if (profile.tokens < 0.5) {
                alert("Not enough tokens! You need 0.5 🪙");
                return false;
            }
            // Deduct 0.5
            updateProfile({
                tokens: parseFloat((profile.tokens - 0.5).toFixed(1)),
                lastRefreshTime: NOW // Reset timer too? Optional. Let's reset to prevent double abuse.
            });
            return true; // Success
        } else {
            // Free check
            const last = profile.lastRefreshTime || 0;
            if (NOW - last < COOLDOWN) {
                const minLeft = Math.ceil((COOLDOWN - (NOW - last)) / 60000);
                alert(`Please wait ${minLeft} minutes for a free refresh.\nOr spend 0.5 tokens to refresh immediately.`);
                return false;
            }
            // Success free
            updateProfile({ lastRefreshTime: NOW });
            return true;
        }
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
            setRoutine,
            completeRoutine,
            refreshRoutine
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    return useContext(StorageContext);
}
