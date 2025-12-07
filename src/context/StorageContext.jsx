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
    lastRoutineDate: '',
    currentStreak: 0,
    bestStreak: 0
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

    const [garden, setGarden] = useState(() => {
        const saved = localStorage.getItem('bio_garden');
        return saved ? JSON.parse(saved) : [];
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

    useEffect(() => {
        localStorage.setItem('bio_garden', JSON.stringify(garden));
    }, [garden]);

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

        // 3. Update Token Logic & Streaks
        setProfile(prev => {
            const lastDate = prev.lastRoutineDate || "";
            let newDailyCount = prev.dailyRoutineCount || 0;
            let newTokens = prev.tokens || 0;
            let currentStreak = prev.currentStreak || 0;
            let bestStreak = prev.bestStreak || 0;

            if (lastDate !== today) {
                newDailyCount = 0;

                // Streak Logic
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDate === yesterdayStr) {
                    currentStreak += 1;
                } else {
                    currentStreak = 1; // Reset or Start new
                }

                if (currentStreak > bestStreak) {
                    bestStreak = currentStreak;
                }
            }

            newDailyCount += 1;
            const earned = 0.2;
            newTokens = (parseFloat(newTokens) + earned).toFixed(1);

            return {
                ...prev,
                dailyRoutineCount: newDailyCount,
                tokens: parseFloat(newTokens),
                lastRoutineDate: today,
                currentStreak,
                bestStreak
            };
        });

        // 4. Grow Plants! (All existing plants grow slightly)
        setGarden(prev => prev.map(plant => {
            if (plant.stage < 3) return { ...plant, stage: plant.stage + 1 }; // Grow next stage
            return plant;
        }));
    }

    const refreshRoutine = (isPaid) => {
        const NOW = Date.now();
        const COOLDOWN = 60 * 60 * 1000; // 1 Hour

        if (isPaid) {
            if (profile.tokens < 0.5) {
                alert("Not enough tokens! You need 0.5 🪙");
                return false;
            }
            updateProfile({
                tokens: parseFloat((profile.tokens - 0.5).toFixed(1)),
                lastRefreshTime: NOW
            });
            return true;
        } else {
            const last = profile.lastRefreshTime || 0;
            if (NOW - last < COOLDOWN) {
                const minLeft = Math.ceil((COOLDOWN - (NOW - last)) / 60000);
                alert(`Please wait ${minLeft} minutes for a free refresh.\nOr spend 0.5 tokens to refresh immediately.`);
                return false;
            }
            updateProfile({ lastRefreshTime: NOW });
            return true;
        }
    }

    const buyPlant = (type, cost) => {
        if (profile.tokens < cost) {
            alert(`Not enough tokens! Need ${cost} 🪙`);
            return false;
        }
        // Deduct cost
        updateProfile({ tokens: parseFloat((profile.tokens - cost).toFixed(1)) });

        // Add Plant
        const newPlant = {
            id: Date.now(),
            type, // 'sunflower', 'rose', 'tree'
            stage: 0, // 0=Seed, 1=Sprout, 2=Bloom, 3=Mature
            plantedAt: new Date().toISOString()
        };
        setGarden(prev => [...prev, newPlant]);
        return true;
    }

    return (
        <StorageContext.Provider value={{
            profile,
            logs,
            todayRoutine,
            garden,
            updateProfile,
            completeOnboarding,
            saveDailyLog,
            getTodayLog,
            setRoutine,
            completeRoutine,
            refreshRoutine,
            buyPlant
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    return useContext(StorageContext);
}
