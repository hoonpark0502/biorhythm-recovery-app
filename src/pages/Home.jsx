import React, { useEffect, useState } from 'react';
import { useStorage } from '../context/StorageContext';

const ROUTINES = [
    "Drink a glass of warm water.",
    "Stretch your arms for 10 seconds.",
    "Look out the window for 1 minute.",
    "Tidy up one small corner of your room.",
    "Write down 3 things you are grateful for.",
    "Listen to your favorite calm song."
];

const Home = ({ onNavigate }) => {
    const { profile, todayRoutine, setRoutine, completeRoutine, refreshRoutine, getTodayLog, logs, updateProfile } = useStorage();
    const [localRoutine, setLocalRoutine] = useState(null);
    const [logDone, setLogDone] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const generateNewRoutine = () => {
        const random = ROUTINES[Math.floor(Math.random() * ROUTINES.length)];
        const newRoutine = { text: random, completed: false, id: Date.now() };
        setRoutine(newRoutine);
        setLocalRoutine(newRoutine);
    }

    const handleRefresh = (paid) => {
        const success = refreshRoutine(paid);
        if (success) {
            generateNewRoutine();
            if (paid) alert("Used 0.5 Token for immediate refresh!");
        }
    }

    useEffect(() => {
        const log = getTodayLog();
        if (log && log.timestamp) setLogDone(true);

        if (!todayRoutine) {
            const random = ROUTINES[Math.floor(Math.random() * ROUTINES.length)];
            const newRoutine = { text: random, completed: false, id: Date.now() };
            setRoutine(newRoutine);
            setLocalRoutine(newRoutine);
        } else {
            setLocalRoutine(todayRoutine);
        }
    }, [todayRoutine]);

    const handleRoutineCheck = () => {
        completeRoutine();
    };

    const handleTimeChange = async (newTime) => {
        if (!confirm(`Set daily alarm to ${newTime}:00?`)) return;

        setIsUpdating(true);
        try {
            if (profile.fcmToken) {
                await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: profile.fcmToken, time: newTime })
                });

                updateProfile({
                    notificationTime: { ...profile.notificationTime, morning: `${newTime}:00` }
                });
                alert(`Alarm set to ${newTime}:00!`);
            } else {
                alert("Please enable notifications in settings or reinstall/re-onboard.");
            }
        } catch (e) {
            alert("Failed to update alarm: " + e.message);
        }
        setIsUpdating(false);
    };

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
                    <p style={{ color: 'var(--color-text-sub)' }}>{new Date().toLocaleDateString()}</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Token Badge (Clickable) */}
                    <div
                        onClick={() => onNavigate('garden')}
                        style={{ background: '#FFF4E6', padding: '6px 12px', borderRadius: '20px', color: '#D97706', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid rgba(217, 119, 6, 0.2)' }}
                    >
                        <span>🪙</span> {profile.tokens || 0}
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▶</span>
                    </div>
                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{ border: 'none', background: 'white', fontSize: '1.2rem', padding: '6px', borderRadius: '50%', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}>
                        ⚙️
                    </button>
                </div>
            </header>

            {/* Settings Panel */}
            {showSettings && (
                <div className="fade-in" style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '24px', boxShadow: 'var(--shadow-card)' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Daily Alarm</h3>
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Current: {profile.notificationTime?.morning || "None"}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {['06', '07', '08', '09', '10', '20', '21', '22'].map(hour => (
                            <button
                                key={hour}
                                disabled={isUpdating}
                                onClick={() => handleTimeChange(hour)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-primary)',
                                    background: profile.notificationTime?.morning?.startsWith(hour) ? 'var(--color-primary)' : 'transparent',
                                    color: profile.notificationTime?.morning?.startsWith(hour) ? 'white' : 'var(--color-primary)',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                }}>
                                {hour}:00
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                        overflow: 'hidden',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%'
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
                        alignItems: 'center',
                        cursor: logDone ? 'default' : 'pointer',
                        width: '100%'
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)', margin: 0 }}>Tiny Routine</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleRefresh(false)} style={{ fontSize: '0.8rem', padding: '4px 8px', border: '1px solid #ddd', borderRadius: '12px', background: 'white' }}>↻ Free (1h)</button>
                                <button onClick={() => handleRefresh(true)} style={{ fontSize: '0.8rem', padding: '4px 8px', border: '1px solid #D97706', borderRadius: '12px', background: '#FFF4E6', color: '#D97706' }}>⚡ Pay 0.5</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={!localRoutine.completed ? handleRoutineCheck : undefined}
                                disabled={localRoutine.completed}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    border: '2px solid var(--color-primary)',
                                    background: localRoutine.completed ? 'var(--color-primary)' : 'transparent',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    color: 'white',
                                    cursor: localRoutine.completed ? 'default' : 'pointer'
                                }}
                            >
                                {localRoutine.completed && "✓"}
                            </button>
                            <div style={{ textDecoration: localRoutine.completed ? 'line-through' : 'none', color: localRoutine.completed ? '#aaa' : '#333' }}>
                                {localRoutine.text}
                            </div>
                        </div>
                        {localRoutine.completed && <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#D97706' }}>✨ Completed! +0.2 Token</p>}
                    </div>
                )}

                {/* 4. Weekly Rhythm Visualization (Clickable) */}
                <div
                    onClick={() => onNavigate('stats')}
                    style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Weekly Rhythm</h3>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>See All &gt;</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px' }}>
                        {weeklyData.map((day, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                {day.mood ? (
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--mood-${day.mood})` }}></div>
                                ) : <div style={{ width: '8px', height: '8px' }}></div>}

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
