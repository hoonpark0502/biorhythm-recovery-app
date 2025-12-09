import React from 'react';

const SYMPTOMS = [
    { id: 'headache', label: 'Headache', icon: '🤕' },
    { id: 'fatigue', label: 'Fatigue', icon: '😫' },
    { id: 'digestion', label: 'Digestion', icon: '🤢' },
    { id: 'palpitation', label: 'Heart Racing', icon: '💓' },
    { id: 'muscle', label: 'Muscle Pain', icon: '💪' },
    { id: 'insomnia', label: 'Insomnia', icon: '👀' },
];

const SymptomSelector = ({ selected = [], onChange }) => {

    const toggleSymptom = (id) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <label style={{ fontWeight: '600', fontSize: '1rem', display: 'block', marginBottom: '12px', color: '#334155' }}>Physical Symptoms (Optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {SYMPTOMS.map(sym => {
                    const isActive = selected.includes(sym.id);
                    return (
                        <button
                            key={sym.id}
                            onClick={() => toggleSymptom(sym.id)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                padding: '10px',
                                borderRadius: '12px',
                                border: isActive ? '1px solid var(--color-primary)' : '1px solid #e2e8f0',
                                background: isActive ? '#f0f9ff' : 'white',
                                color: isActive ? 'var(--color-primary)' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{sym.icon}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: isActive ? '600' : '400' }}>{sym.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default SymptomSelector;
