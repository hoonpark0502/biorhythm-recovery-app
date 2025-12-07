import React from 'react';

const SleepSlider = ({ value, onChange }) => {
    return (
        <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <label style={{ fontWeight: '600', fontSize: '1.1rem' }}>Sleep Hours</label>
                <span style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>{value} hr</span>
            </div>
            <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ccc', marginTop: '8px' }}>
                <span>0h</span>
                <span>6h</span>
                <span>12h+</span>
            </div>
        </div>
    );
};

export default SleepSlider;
