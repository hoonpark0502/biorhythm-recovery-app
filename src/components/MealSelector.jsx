import React from 'react';

const MealSelector = ({ value, onChange }) => {
    const options = [0, 1, 2, 3];

    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', marginTop: '16px' }}>
            <label style={{ fontWeight: '600', fontSize: '1.1rem', display: 'block', marginBottom: '16px' }}>Meals Today</label>
            <div style={{ display: 'flex', gap: '12px' }}>
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            background: value === opt ? 'var(--color-primary)' : '#f0f0f0',
                            color: value === opt ? 'white' : 'var(--color-text-main)',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            border: value === opt ? 'none' : '1px solid transparent'
                        }}
                    >
                        {opt === 3 ? '3+' : opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MealSelector;
