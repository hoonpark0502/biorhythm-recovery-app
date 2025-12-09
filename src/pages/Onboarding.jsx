import React, { useState, useEffect, useRef } from 'react';
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

    // Audio Refs
    const audioCtxRef = useRef(null);
    const nodesRef = useRef([]);

    const startAmbientPad = () => {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        // Prevent multiple stacks
        if (nodesRef.current.length > 0) return;

        // MASTER GAIN (Volume Control)
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.0; // Start silent
        masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 4); // Slow fade in
        masterGain.connect(ctx.destination);

        // DELAY LINE (The "Mystic" Echo)
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.7; // 700ms echo
        const feedback = ctx.createGain();
        feedback.gain.value = 0.4; // Decay

        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(masterGain); // Send echo to master

        // FILTER (The "Breathing")
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Deep start
        filter.Q.value = 1;
        filter.connect(masterGain); // Dry signal
        filter.connect(delay);      // Wet signal

        // FILTER LFO
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05; // 20s cycle (Very slow breath)
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 300; // Sweep range +/- 300Hz
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        // OSCILLATORS ("Mystic" Chord: C Minor 11 Spread)
        // C2, G2, Bb3, Eb3, F4, D4(9)
        const freqs = [
            65.41,  // C2 (Deep Root)
            98.00,  // G2 (Fifth)
            233.08, // Bb3 (Minor 7)
            311.13, // Eb4 (Minor 3) -> High mystic feel
            349.23, // F4  (11th - The Suspended Mystery)
            587.33  // D5  (9th - Sparkle)
        ];

        freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            // Mix Sine (Pure) and Triangle (Warm)
            osc.type = i > 4 ? 'sine' : 'triangle';

            // Detune slightly for "Chorus" effect
            const detune = (Math.random() - 0.5) * 6; // +/- 3 cents
            osc.detune.value = detune;
            osc.frequency.value = f;

            const oscGain = ctx.createGain();
            // Randomize volumes slightly for organic texture
            oscGain.gain.value = 0.05 + Math.random() * 0.02;

            osc.connect(oscGain);
            oscGain.connect(filter);

            osc.start();
            nodesRef.current.push(osc, oscGain);
        });

        // Track effect nodes for cleanup
        nodesRef.current.push(masterGain, filter, lfo, lfoGain, delay, feedback);
    };

    const stopAudio = () => {
        if (audioCtxRef.current) {
            const ctx = audioCtxRef.current;
            nodesRef.current.forEach(node => {
                try {
                    // Fade out Oscillators and Master
                    if (node.gain) {
                        node.gain.cancelScheduledValues(ctx.currentTime);
                        node.gain.linearRampToValueAtTime(0, ctx.currentTime + 3); // 3s fade out
                    }
                    setTimeout(() => {
                        if (node.stop) node.stop();
                        node.disconnect();
                    }, 3500);
                } catch (e) { }
            });
            nodesRef.current = [];
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    const playSuccessSound = () => {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const playNote = (freq, time) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
            gain.gain.setValueAtTime(0.1, ctx.currentTime + time);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + time);
            osc.stop(ctx.currentTime + time + 1);
        };

        // Major Chord Arpeggio (C5, E5, G5, C6)
        playNote(523.25, 0);
        playNote(659.25, 0.1);
        playNote(783.99, 0.2);
        playNote(1046.50, 0.3);
    };

    const handleNext = async () => {
        // Start Ambient Pad on first interaction
        startAmbientPad();

        // Validation: Name
        if (step === 1 && name.trim() === '') {
            alert("Please tell me your name (or a nickname) to continue.");
            return;
        }

        if (step === 5) {
            setIsLoading(true);
            try {
                // Request Permission
                const token = await requestNotificationPermission();
                if (token) {
                    updateProfile({ fcmToken: token });
                    await fetch('/api/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token, time: '08' })
                    });
                }
            } catch (e) {
                console.warn(e);
            }

            // SUCCESS EFFECT
            playSuccessSound();

            // Delay for effect
            setTimeout(() => {
                setIsLoading(false);
                stopAudio(); // Stop bgm
                completeOnboarding(name || 'Friend');
            }, 1500);
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(prev => prev - 1);
    };

    const TutorialSlide = ({ icon, title, desc, extra }) => (
        <div className="fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>{icon}</div>
            <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>{title}</h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '280px', margin: '0 auto' }}>
                {desc}
            </p>
            {extra}
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
        <div className="onboarding-container fade-in" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* PROGRESS INDICATOR - Static at Top */}
            <div style={{ paddingTop: '20px', paddingBottom: '20px', display: 'flex', justifyContent: 'center', gap: '8px', minHeight: '40px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: i === step ? 'var(--color-primary)' : '#e2e8f0',
                        transition: 'all 0.3s'
                    }} />
                ))}
            </div>

            {/* CONTENT - Flex Grow to take available space */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
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
                    <div className="fade-in" style={{ textAlign: 'center', width: '100%' }}>
                        <h2 style={{ marginBottom: '24px' }}>What should I call you?</h2>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nickname (Required)"
                            style={{
                                width: '100%', padding: '16px', fontSize: '1.2rem',
                                borderRadius: 'var(--radius-md)', border: '2px solid var(--color-secondary)',
                                outline: 'none', textAlign: 'center', background: 'transparent'
                            }}
                        />
                        <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#999' }}>This will be your safe name here.</p>
                    </div>
                )}

                {step === 2 && (
                    <TutorialSlide
                        icon="📝"
                        title="Daily Check-in"
                        desc="Record your sleep, meals, and mood in just 10 seconds."
                    />
                )}

                {step === 3 && (
                    <TutorialSlide
                        icon="🌊"
                        title="River of Stars"
                        desc="Got a heavy thought? Buy a stone and throw it into the river."
                        extra={
                            <div style={{ marginTop: '20px', background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Look for this icon in the menu:</span>
                                <div style={{ fontSize: '2rem', marginTop: '8px' }}>🌸</div>
                            </div>
                        }
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
                            <div>Click 'Start Journey' to enable</div>
                        </div>
                    </div>
                )}
            </div>

            {/* NAVIGATION - Static at Bottom */}
            <div style={{ marginTop: '20px', paddingBottom: '20px', display: 'flex', gap: '12px' }}>
                {step > 0 && (
                    <button
                        onClick={handleBack}
                        style={{
                            background: '#F1F5F9', color: '#64748b',
                            padding: '16px', borderRadius: '50px',
                            border: 'none', fontSize: '1.2rem', cursor: 'pointer',
                            flex: '0 0 auto', width: '60px'
                        }}
                    >
                        ←
                    </button>
                )}
                <button
                    onClick={handleNext}
                    disabled={isLoading}
                    style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-float)',
                        border: 'none',
                        flex: 1,
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
