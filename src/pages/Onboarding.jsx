import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { motion } from 'framer-motion';

// Note: Using inline styles for speed/colocation in MVP, can move to CSS modules later.
// Using standard div for now, simulating framer-motion behavior with CSS classes in index.css

const Onboarding = ({ onFinish }) => {
    const { completeOnboarding } = useStorage();
    const [step, setStep] = useState(0); // 0: Welcome, 1: Name, 2: Notification
    const [name, setName] = useState('');

    const handleNext = () => {
        if (step === 2) {
            completeOnboarding(name || 'Friend');
            // onFinish is handled by App listening to context
        } else {
            setStep(prev => prev + 1);
        }
    };

    return (
        <div className="onboarding-container fade-in" style={{ padding: '40px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {step === 0 && (
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: '16px', fontSize: '2rem' }}>Deep Breath.</h1>
                    <p style={{ color: 'var(--color-text-sub)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Welcome to your safe space.<br />
                        Let's find your rhythm again, together.
                    </p>
                </div>
            )}

            {step === 1 && (
                <div className="fade-in" style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '24px' }}>What should I call you?</h2>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nickname"
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '1.2rem',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid var(--color-secondary)',
                            outline: 'none',
                            textAlign: 'center',
                            background: 'transparent'
                        }}
                    />
                    <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#999' }}>You can stay anonymous if you like.</p>
                </div>
            )}

            {step === 2 && (
                <div className="fade-in" style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '16px' }}>Let's keep in touch.</h2>
                    <p style={{ color: 'var(--color-text-sub)', marginBottom: '32px' }}>
                        We'll send you a gentle reminder<br />
                        daily to check in on your rhythm.
                    </p>
                    <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', display: 'inline-block' }}>
                        <div>☀️ Morning Check-in: 08:00</div>
                        <div style={{ marginTop: '10px' }}>🌙 Evening Routine: 20:00</div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '60px', textAlign: 'center' }}>
                <button
                    onClick={handleNext}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '16px 48px',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-float)',
                        width: '100%'
                    }}>
                    {step === 2 ? "Start Journey" : "Next"}
                </button>
            </div>

        </div>
    );
};

export default Onboarding;
