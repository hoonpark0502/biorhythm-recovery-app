import React from 'react';

const MoodSelector = ({ value, onChange }) => {
    const moods = [
        { id: 'worst', emoji: '😫', label: 'Worst', color: 'var(--mood-worst)' },
        { id: 'bad', emoji: '😞', label: 'Bad', color: 'var(--mood-bad)' },
        { id: 'soso', emoji: '😐', label: 'So-so', color: 'var(--mood-soso)' },
        { id: 'good', emoji: '🙂', label: 'Good', color: 'var(--mood-good)' },
        { id: 'great', emoji: '🥰', label: 'Great', color: 'var(--mood-great)' },
    ];

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginTop: '16px' }}>
            <label style={{ fontWeight: '600', fontSize: '1.1rem', display: 'block', marginBottom: '16px' }}>Mood Today</label>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {moods.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => onChange(m.id)}
                        style={{
                            background: 'transparent',
                            fontSize: value === m.id ? '2.5rem' : '1.8rem',
                            opacity: value === m.id ? 1 : 0.5,
                            transform: value === m.id ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {m.emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MoodSelector;
