import React from 'react';

const InputRow = ({ label, value, onChange, minLabel, maxLabel, icon }) => (
    <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{icon} <strong>{label}</strong></span>
            <span>{value} / 5</span>
        </div>
        <input
            type="range"
            min="1"
            max="5"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
        </div>
    </div>
);

const ConditionInput = ({ energy, setEnergy, anxiety, setAnxiety }) => {
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <InputRow
                label="Energy Level"
                value={energy}
                onChange={setEnergy}
                minLabel="Exhausted"
                maxLabel="Energetic"
                icon="⚡"
            />
            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '20px 0' }} />
            <InputRow
                label="Anxiety / Stress"
                value={anxiety}
                onChange={setAnxiety}
                minLabel="Calm"
                maxLabel="Overwhelmed"
                icon="😰"
            />
        </div>
    );
};

export default ConditionInput;
