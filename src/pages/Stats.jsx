import React from 'react';
import { useStorage } from '../context/StorageContext';

const MOOD_COLORS = {
    great: '#4ADE80', // Green
    good: '#60A5FA',  // Blue
    soso: '#FACC15',  // Yellow
    bad: '#FB923C',   // Orange
    worst: '#F87171'  // Red
};

const Stats = ({ onBack }) => {
    const { logs, profile } = useStorage();

    // Helper: Get days for current month grid
    const getMonthDays = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-indexed

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];
        // Fill empty slots for start of week
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }
        // Fill actual days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dateStr = new Date(year, month, i + 1).toISOString().split('T')[0];
            days.push({ day: i, dateStr });
        }
        return days;
    };

    const days = getMonthDays();
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });

    // Calculate Stats
    const calculateStats = () => {
        const entries = Object.values(logs);
        if (entries.length === 0) return { avgSleep: 0, total: 0 };

        const totalSleep = entries.reduce((acc, curr) => acc + (curr.sleepHours || 0), 0);
        return {
            avgSleep: (totalSleep / entries.length).toFixed(1),
            total: entries.length
        };
    };

    const stats = calculateStats();

    return (
        <div className="page-container fade-in" style={{ padding: '24px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={onBack} style={{ fontSize: '1.5rem', background: 'transparent', marginRight: '16px', border: 'none', cursor: 'pointer' }}>←</button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>My Journey</h1>
            </div>

            {/* SUMMARY CARD */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '32px', boxShadow: 'var(--shadow-card)', display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{stats.total}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Days Logged</div>
                </div>
                <div style={{ width: '1px', background: '#eee' }}></div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{stats.avgSleep}h</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Avg Sleep</div>
                </div>
            </div>

            {/* CALENDAR */}
            <h3 style={{ marginBottom: '16px' }}>{monthName} Moods</h3>
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: 'var(--shadow-card)' }}>
                {/* Weekday Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#999' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                </div>

                {/* Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {days.map((d, i) => {
                        if (!d) return <div key={i}></div>;

                        const log = logs[d.dateStr];
                        const color = log?.mood ? MOOD_COLORS[log.mood] : '#f3f4f6';

                        return (
                            <div key={i} style={{
                                aspectRatio: '1',
                                background: color,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                color: log?.mood ? 'white' : '#ccc',
                                fontWeight: log?.mood ? 'bold' : 'normal',
                                position: 'relative'
                            }}>
                                {d.day}
                                {log?.routineCompleted && <div style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', background: 'white', borderRadius: '50%' }}></div>}
                            </div>
                        );
                    })}
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '0.75rem', color: '#666' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', background: MOOD_COLORS.great, borderRadius: '2px' }}></div>Great</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', background: MOOD_COLORS.soso, borderRadius: '2px' }}></div>So-so</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', background: MOOD_COLORS.bad, borderRadius: '2px' }}></div>Bad</div>
                </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>
                "Small steps every day."
            </p>
        </div>
    );
};

export default Stats;
