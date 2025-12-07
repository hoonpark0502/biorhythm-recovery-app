import React, { useState, useEffect, useRef } from 'react';

// --- Sub-components for Relief Steps ---

const BreathingStep = ({ onNext }) => {
    const [isBreathing, setIsBreathing] = useState(false);
    const [soundType, setSoundType] = useState('rain'); // rain, wind, stream

    // Use refs to persist audio context across renders
    const audioCtxRef = useRef(null);
    const gainNodeRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const filterNodeRef = useRef(null);

    // --- Audio Generation Logic ---
    const createNoiseBuffer = (ctx) => {
        const bufferSize = ctx.sampleRate * 2; // 2 sec loop
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate White Noise first
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        // Processing for Pink/Brown noise happens via filtering or algo
        // For simplicity:
        // Brown (Rain-like): 1/f^2
        if (soundType === 'rain') {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + (0.02 * white)) / 1.02;
                data[i] = lastOut * 3.5;
            }
        }
        return buffer;
    };

    const setupAudioGraph = (ctx, type) => {
        // Disconnect old nodes if any
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch (e) { }
            sourceNodeRef.current.disconnect();
        }

        // 1. Create Source with appropriate buffer
        let buffer;
        const bufferSize = ctx.sampleRate * 2;
        const tempBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = tempBuffer.getChannelData(0);

        if (type === 'rain') {
            // Brown Noise algo
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + (0.02 * white)) / 1.02;
                data[i] = lastOut * 3.5;
            }
        } else {
            // White Noise (base for others)
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        }
        buffer = tempBuffer;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // 2. Create Filter based on Type
        const filter = ctx.createBiquadFilter();
        if (type === 'rain') {
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Muffled
        } else if (type === 'wind') {
            filter.type = 'bandpass';
            filter.frequency.value = 500; // Hollow
            filter.Q.value = 0.5;
        } else if (type === 'stream') {
            filter.type = 'lowpass';
            filter.frequency.value = 800; // Crisper water
        }

        // 3. Gain
        const gain = ctx.createGain();
        gain.gain.value = type === 'wind' ? 0.8 : 0.15;

        // Connect
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start(0);

        // Store
        sourceNodeRef.current = source;
        filterNodeRef.current = filter;
        gainNodeRef.current = gain;
    };

    const handleStart = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
        }

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        setupAudioGraph(ctx, soundType);
        setIsBreathing(true);
    };

    const handleSwitchSound = (newType) => {
        setSoundType(newType);
        // If already playing, switch smoothly
        if (isBreathing && audioCtxRef.current) {
            setupAudioGraph(audioCtxRef.current, newType);
        }
    };

    const handleStop = () => {
        setIsBreathing(false);
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch (e) { }
        }
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close(); } catch (e) { }
        }
        audioCtxRef.current = null;
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                try { audioCtxRef.current.close(); } catch (e) { }
            }
        };
    }, []);

    return (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>Deep Breathing</h2>

            {!isBreathing ? (
                <div className="fade-in">
                    <p style={{ marginBottom: '32px', color: '#666' }}>
                        Choose your calming sound<br />
                        and follow the circle.
                    </p>

                    {/* Sound Selector */}
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
                        {[
                            { id: 'rain', label: 'Rain', icon: '🌧️' },
                            { id: 'wind', label: 'Wind', icon: '🌬️' },
                            { id: 'stream', label: 'Stream', icon: '💧' },
                        ].map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSoundType(s.id)}
                                style={{
                                    background: soundType === s.id ? '#E0F2FE' : 'white',
                                    border: `2px solid ${soundType === s.id ? '#0EA5E9' : '#eee'}`,
                                    borderRadius: '16px',
                                    padding: '12px',
                                    width: '80px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</div>
                                <div style={{ fontSize: '0.8rem', color: soundType === s.id ? '#0284C7' : '#999' }}>{s.label}</div>
                            </button>
                        ))}
                    </div>

                    <button onClick={handleStart} className="btn-primary" style={{ padding: '16px 48px' }}>
                        Start
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '16px' }}>(Turn off Silent Mode)</p>
                </div>
            ) : (
                <div className="fade-in" style={{ width: '100%' }}>
                    <div className="breathing-circle"></div>
                    <p style={{ marginTop: '40px', color: '#666' }}>
                        Inhale (4s) ... Hold (4s) ... Exhale (6s)
                    </p>

                    {/* Switcher while playing */}
                    <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {['rain', 'wind', 'stream'].map(t => (
                            <button
                                key={t}
                                onClick={() => handleSwitchSound(t)}
                                style={{
                                    width: '12px', height: '12px', borderRadius: '50%',
                                    border: 'none',
                                    background: soundType === t ? 'var(--color-primary)' : '#ddd',
                                    cursor: 'pointer'
                                }}
                            />
                        ))}
                    </div>

                    <button onClick={handleStop} style={{ marginTop: '32px', background: 'transparent', border: '2px solid #eee', padding: '8px 24px', borderRadius: '20px', cursor: 'pointer' }}>
                        Stop
                    </button>
                    <div style={{ marginTop: '20px' }}>
                        <button onClick={onNext} className="btn-primary" style={{ width: '100%' }}>
                            I feel calmer
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        .breathing-circle {
          width: 200px;
          height: 200px;
          background: var(--color-primary);
          border-radius: 50%;
          opacity: 0.8;
          margin: 0 auto;
          animation: breath 14s infinite ease-in-out; 
        }
        @keyframes breath {
          0% { transform: scale(0.4); opacity: 0.4; } 
          28% { transform: scale(1); opacity: 1; }   
          57% { transform: scale(1); opacity: 1; }   
          100% { transform: scale(0.4); opacity: 0.4; } 
        }
      `}</style>
        </div>
    );
};

const GroundingStep = ({ onNext }) => {
    const [checks, setChecks] = useState({ see: false, hear: false, touch: false });

    return (
        <div style={{ padding: '0 10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '10px' }}>Ground Yourself.</h2>
            <p style={{ marginBottom: '30px', color: '#666' }}>Look around you. Find:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <label className="checkbox-card" style={{ padding: '20px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
                    <input type="checkbox" checked={checks.see} onChange={() => setChecks(p => ({ ...p, see: !p.see }))} style={{ width: '24px', height: '24px' }} />
                    <span style={{ fontSize: '1.1rem' }}>👀 5 things you check <b>see</b></span>
                </label>
                <label className="checkbox-card" style={{ padding: '20px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
                    <input type="checkbox" checked={checks.touch} onChange={() => setChecks(p => ({ ...p, touch: !p.touch }))} style={{ width: '24px', height: '24px' }} />
                    <span style={{ fontSize: '1.1rem' }}>✋ 4 things you can <b>touch</b></span>
                </label>
                <label className="checkbox-card" style={{ padding: '20px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-card)' }}>
                    <input type="checkbox" checked={checks.hear} onChange={() => setChecks(p => ({ ...p, hear: !p.hear }))} style={{ width: '24px', height: '24px' }} />
                    <span style={{ fontSize: '1.1rem' }}>👂 3 things you can <b>hear</b></span>
                </label>
            </div>

            <button onClick={onNext} className="btn-primary" style={{ marginTop: 'auto', width: '100%' }} disabled={!checks.see && !checks.touch && !checks.hear}>
                Done
            </button>
        </div>
    );
};

const TrashStep = ({ onFinish }) => {
    const [thought, setThought] = useState('');
    const [isThrowing, setIsThrowing] = useState(false);

    const handleThrow = () => {
        if (!thought) return;
        setIsThrowing(true);
        setTimeout(() => {
            onFinish();
        }, 1500);
    };

    if (isThrowing) {
        return (
            <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ fontSize: '1.5rem', animation: 'flyAway 1s forwards' }}>🗑️ Poof! Gone.</div>
                <style>{`
                  @keyframes flyAway {
                      0% { transform: scale(1) rotate(0deg); opacity: 1; }
                      100% { transform: scale(0) rotate(720deg); opacity: 0; }
                  }
              `}</style>
            </div>
        )
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '16px' }}>Thought Trash Can.</h2>
            <p style={{ marginBottom: '24px', color: '#666' }}>Write down what's bothering you, then throw it away.</p>

            <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="I am worried about..."
                style={{
                    width: '100%',
                    height: '200px',
                    padding: '20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#f0f0f0',
                    fontSize: '1.1rem',
                    resize: 'none',
                    fontFamily: 'inherit'
                }}
            />

            <button onClick={handleThrow} className="btn-primary" style={{ marginTop: 'auto', width: '100%' }} disabled={!thought}>
                Throw it away
            </button>
        </div>
    );
};

// --- Main Flow Component ---

const ReliefFlow = ({ onExit }) => {
    const [step, setStep] = useState(0);

    const handleNext = () => setStep(p => p + 1);
    const handleFinish = () => onExit();

    return (
        <div className="page-container fade-in" style={{ padding: '24px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={onExit} style={{ background: 'none', fontSize: '1.5rem', marginRight: '16px', border: 'none', cursor: 'pointer' }}>✕</button>
                <div style={{ flex: 1, height: '6px', background: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${((step + 1) / 3) * 100}%`,
                        height: '100%',
                        background: 'var(--color-primary)',
                        transition: 'width 0.3s'
                    }}></div>
                </div>
            </div>

            <div style={{ flex: 1 }}>
                {step === 0 && <BreathingStep onNext={handleNext} />}
                {step === 1 && <GroundingStep onNext={handleNext} />}
                {step === 2 && <TrashStep onFinish={handleFinish} />}
            </div>

            <style>{`
          .btn-primary {
              background: var(--color-primary);
              color: white;
              padding: 16px;
              border-radius: 50px;
              font-size: 1.1rem;
              font-weight: 600;
              box-shadow: var(--shadow-float);
              transition: transform 0.1s;
              border: none;
              cursor: pointer;
          }
          .btn-primary:active {
              transform: scale(0.98);
          }
          .btn-primary:disabled {
              background: #ccc;
              box-shadow: none;
              cursor: not-allowed;
          }
      `}</style>
        </div>
    );
};

export default ReliefFlow;
