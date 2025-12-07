import React, { useEffect, useState } from 'react';
import { useStorage } from '../context/StorageContext';

// Simple routine generator
const ROUTINES = [
    "Drink a glass of warm water.",
    "Stretch your arms for 10 seconds.",
    "Look out the window for 1 minute.",
    "Tidy up one small corner of your room.",
    "Write down 3 things you are grateful for.",
    "Listen to your favorite calm song."
];

const Home = ({ onNavigate }) => {
    const { profile, todayRoutine, setRoutine, completeRoutine, getTodayLog, logs } = useStorage();
    const [localRoutine, setLocalRoutine] = useState(null);
    const [logDone, setLogDone] = useState(false);

    useEffect(() => {
        // Check if check-in is done
        const log = getTodayLog();
        if (log && log.timestamp) setLogDone(true);

        // Initialize Routine if none
        if (!todayRoutine) {
            const random = ROUTINES[Math.floor(Math.random() * ROUTINES.length)];
            setRoutine({ text: random, completed: false });
            setLocalRoutine({ text: random, completed: false });
        } else {
            setLocalRoutine(todayRoutine);
        }
    }, [todayRoutine]);

    const handleRoutineCheck = () => {
        completeRoutine();
        // Animation/Feedback is handled by re-render showing unchecked -> checked state
        // We can add a confetti effect later
    };

    // Helper for Weekly Rhythm (Last 7 days simplified)
    const getWeeklyData = () => {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = logs[dateStr];
            data.push({
                day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                mood: log?.mood,
                sleep: log?.sleepHours || 0,
            });
        }
        return data;
    };

    const weeklyData = getWeeklyData();

    return (
        <div className="page-container fade-in" style={{ padding: '24px', paddingBottom: '40px' }}>
            <header style={{ marginBottom: '24px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)' }}>Hi, {profile.name || 'Friend'}</h1>
                    <p style={{ color: 'var(--color-text-sub)' }}>How are you feeling today?</p>
                </div>
                {/* Settings Icon Placeholder */}
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eee' }}></div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* 1. SOS Card */}
                <button
                    onClick={() => onNavigate('relief')}
                    style={{
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
                        boxShadow: 'var(--shadow-card)',
                        textAlign: 'left',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>I'm struggling</h3>
                        <p style={{ opacity: 0.9 }}>Tap for immediate relief tools.</p>
                    </div>
                </button>

                {/* 2. Daily Check Card */}
                <button
                    onClick={() => onNavigate('dailyCheck')}
                    disabled={logDone}
                    style={{
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        background: logDone ? '#F7FAFC' : 'white',
                        border: logDone ? '1px solid #EDF2F7' : 'none',
                        boxShadow: logDone ? 'none' : 'var(--shadow-card)',
                        textAlign: 'left',
                        color: logDone ? '#A0AEC0' : 'var(--color-text-main)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{logDone ? "Check-in Complete" : "Daily Check-in"}</h3>
                        <p style={{ color: logDone ? '#CBD5E0' : '#666', fontSize: '0.9rem' }}>{logDone ? "Well done." : "Track your sleep & mood."}</p>
                    </div>
                    <div style={{ fontSize: '1.5rem' }}>{logDone ? "✅" : "📝"}</div>
                </button>

                {/* 3. Tiny Routine */}
                {localRoutine && (
                    <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>Tiny Routine</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={!localRoutine.completed ? handleRoutineCheck : undefined}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    border: '2px solid var(--color-primary)',
                                    background: localRoutine.completed ? 'var(--color-primary)' : 'transparent',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    color: 'white'
                                }}
                            >
                                {localRoutine.completed && "✓"}
                            </button>
                            <div style={{ textDecoration: localRoutine.completed ? 'line-through' : 'none', color: localRoutine.completed ? '#aaa' : '#333' }}>
                                {localRoutine.text}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Weekly Rhythm Visualization */}
                <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Weekly Rhythm</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px' }}>
                        {weeklyData.map((day, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                {/* Mood Dot */}
                                {day.mood ? (
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--mood-${day.mood})` }}></div>
                                ) : <div style={{ width: '8px', height: '8px' }}></div>}

                                {/* Sleep Bar */}
                                <div style={{
                                    width: '12px',
                                    height: `${Math.min(day.sleep * 8, 60)}px`,
                                    background: '#EDF2F7',
                                    borderRadius: '4px',
                                    position: 'relative'
                                }}>
                                    {day.sleep > 0 && <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', background: 'var(--color-primary)', opacity: 0.5, borderRadius: '4px' }}></div>}
                                </div>

                                <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{day.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;
