import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

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
    tokens: 20,
    hasWelcomeGift: true, // New users start with gift
    dailyRoutineCount: 0,
    lastRoutineDate: '',
    currentStreak: 0,
    bestStreak: 0
};

export function StorageProvider({ children }) {
    const { user } = useAuth();

    // Cloud Sync State
    const [isSynced, setIsSynced] = useState(false);

    // Initial State
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

    // 1. PULL from Firestore on login
    useEffect(() => {
        if (!user || !db) return; // Safely exit if no DB or User

        const syncData = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    console.log("Cloud data found:", data);

                    // Merge Strategy: Remote overwrites local for simplicity in this MVP
                    if (data.profile) setProfile(data.profile);
                    if (data.logs) setLogs(data.logs);
                    if (data.garden) setGarden(data.garden);
                } else {
                    console.log("No cloud data. Creating...");
                }
                setIsSynced(true);
            } catch (error) {
                console.error("Sync Error:", error);
            }
        };

        syncData();
    }, [user]);

    // 2. PUSH to Firestore on change (Debounced)
    useEffect(() => {
        if (!user || !isSynced || !db) return; // Safely exit if no DB

        const timeoutId = setTimeout(async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                await setDoc(docRef, {
                    profile,
                    logs,
                    garden,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
                console.log("Synced to Cloud");
            } catch (e) {
                console.error("Push Error", e);
            }
        }, 3000); // 3-sec debounce

        return () => clearTimeout(timeoutId);
    }, [profile, logs, garden, user, isSynced]);

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
    };

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
    };

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
    };

    // Migration: Convert old Garden items to Stars in the Sky
    useEffect(() => {
        if (garden.some(item => !item.isStar)) {
            console.log("Migrating items to Stars...");
            const newGarden = garden.map(item => {
                if (item.isStar) return item;

                // Random Sky Position
                // Y: 5 to 15 (High up)
                // X: -20 to 20 (Wide spread)
                // Z: -10 to -30 (Deep background)
                const x = (Math.random() * 40) - 20;
                const y = 5 + Math.random() * 10;
                const z = -10 - (Math.random() * 20);

                return {
                    ...item,
                    isStar: true,
                    type: 'star',
                    originType: item.type || 'unknown',
                    position: [x, y, z]
                };
            });
            setGarden(newGarden);
        }
    }, [garden]);

    // Migration: Welcome Bonus for Existing Users
    useEffect(() => {
        if (!profile.hasWelcomeGift) {
            console.log("Granting Welcome Bonus: 20 Tokens");
            const current = parseFloat(profile.tokens) || 0;
            updateProfile({
                tokens: current + 20,
                hasWelcomeGift: true
            });
        }
    }, [profile]); // Runs once per profile load/update until flag is set

    const throwObject = (type, cost) => {
        if (profile.tokens < cost) {
            alert(`Not enough tokens! Need ${cost} 🪙`);
            return false;
        }
        updateProfile({ tokens: parseFloat((profile.tokens - cost).toFixed(1)) });

        // Create Star Position immediately (Sublimation)
        const x = (Math.random() * 40) - 20;
        const y = 5 + Math.random() * 10;
        const z = -10 - (Math.random() * 20);

        const newStar = {
            id: Date.now(),
            type: 'star',
            originType: type, // 'stone', 'pebble', 'branch'
            position: [x, y, z],
            isStar: true,
            plantedAt: new Date().toISOString()
        };
        setGarden(prev => [...prev, newStar]);
        return true;
    };

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
            throwObject,
            buyOrnament: throwObject // Backward compatibility
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    return useContext(StorageContext);
}
