import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { requestNotificationPermission } from '../firebase';

const Onboarding = ({ onFinish }) => {
    const { completeOnboarding, updateProfile } = useStorage();
    const [step, setStep] = useState(0);
    // Step Map:
    // 0: Intro
    // 1: Name Input
    // 2: Tutorial - Daily Check
    // 3: Tutorial - River
    // 4: Tutorial - Relief
    // 5: Permission & Finish

    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = async () => {
        if (step === 5) {
            setIsLoading(true);
            try {
                // Request Permission
                const token = await requestNotificationPermission();
                if (token) {
                    updateProfile({ fcmToken: token });
                    // Subscribe logic...
                    await fetch('/api/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token, time: '08' })
                    });
                    alert("Notifications enabled! You'll receive a test message soon.");
                }
            } catch (e) {
                // Ignore permission errors in MVP
                console.warn(e);
            }
            setIsLoading(false);
            completeOnboarding(name || 'Friend');
        } else {
            setStep(prev => prev + 1);
        }
    };

    const TutorialSlide = ({ icon, title, desc, color }) => (
        <div className="fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>{icon}</div>
            <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>{title}</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '280px', margin: '0 auto' }}>
                {desc}
            </p>
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );

    return (
        <div className="onboarding-container fade-in" style={{ padding: '100px 24px 40px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>

            {/* PROGRESS INDICATOR */}
            <div style={{ position: 'absolute', top: '40px', left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: i === step ? 'var(--color-primary)' : '#e2e8f0',
                        transition: 'all 0.3s'
                    }} />
                ))}
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {step === 0 && (
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ color: 'var(--color-primary-dark)', marginBottom: '16px', fontSize: '2rem' }}>Deep Breath.</h1>
                        <p style={{ color: 'var(--color-text-sub)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '24px' }}>
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
                                width: '100%', padding: '16px', fontSize: '1.2rem',
                                borderRadius: 'var(--radius-md)', border: '2px solid var(--color-secondary)',
                                outline: 'none', textAlign: 'center', background: 'transparent'
                            }}
                        />
                        <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#999' }}>You can stay anonymous if you like.</p>
                    </div>
                )}

                {step === 2 && (
                    <TutorialSlide
                        icon="📝"
                        title="Daily Check-in"
                        desc="Record your sleep, meals, and mood in just 10 seconds. Consistency is key to recovery."
                    />
                )}

                {step === 3 && (
                    <TutorialSlide
                        icon="🌊"
                        title="River of Stars"
                        desc="Got a heavy thought? Buy a stone and throw it into the river. Watch it become a star in the sky."
                    />
                )}

                {step === 4 && (
                    <TutorialSlide
                        icon="😌"
                        title="Relief Flow"
                        desc="Feeling overwhelmed? Use our emergency breathing tool to find calm immediately."
                    />
                )}

                {step === 5 && (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '16px' }}>Let's keep in touch.</h2>
                        <p style={{ color: 'var(--color-text-sub)', marginBottom: '32px' }}>
                            Allow notifications to receive<br />daily rhythm reminders.
                        </p>
                        <div style={{ background: 'white', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', display: 'inline-block' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔔</div>
                            <div>Click 'Start' to enable</div>
                        </div>
                    </div>
                )}
            </div>

            {/* NAVIGATION */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                    onClick={handleNext}
                    disabled={isLoading}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '16px 48px',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-float)',
                        width: '100%',
                        opacity: isLoading ? 0.7 : 1,
                        transition: 'transform 0.1s'
                    }}>
                    {isLoading ? "Setting up..." : (step === 5 ? "Start Journey" : "Next")}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
