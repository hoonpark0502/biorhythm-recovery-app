import React, { useState, useEffect, useRef } from 'react';
// --- Sub-components for Relief Steps ---

const BreathingStep = ({ onNext }) => {
    const [phase, setPhase] = useState('Ready');
    const [isBreathing, setIsBreathing] = useState(false);
    const [audioObj, setAudioObj] = useState(null);

    const handleStart = () => {
        // iOS Fix: Create Audio object directly on click
        const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3");
        audio.loop = true;
        audio.volume = 0.5;

        // Explicitly load first (helps with "Operation not supported")
        audio.load();

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Success
                    setAudioObj(audio); // Save to state to stop later
                    setIsBreathing(true);
                })
                .catch(e => {
                    console.error("Audio blocked", e);
                    alert(`Sound blocked: ${e.message}\n(Try turning off Silent Mode switch on valid MP3)`);
                });
        }
    };

    const handleStop = () => {
        setIsBreathing(false);
        if (audioObj) {
            audioObj.pause();
            audioObj.currentTime = 0;
            setAudioObj(null); // Clear state
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioObj) {
                audioObj.pause();
                setAudioObj(null);
            }
        };
    }, [audioObj]);

    return (
        <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>Deep Breathing</h2>

            {!isBreathing ? (
                <div className="fade-in">
                    <p style={{ marginBottom: '32px', color: '#666' }}>
                        Calm rain sounds will play.<br />
                        Follow the circle.
                    </p>
                    <button onClick={handleStart} className="btn-primary" style={{ padding: '16px 48px' }}>
                        Start
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '16px' }}>(Turn off Silent Mode)</p>
                </div>
            ) : (
                <div className="fade-in">
                    <div className="breathing-circle"></div>
                    <p style={{ marginTop: '40px', color: '#666' }}>
                        Inhale (4s) ... Hold (4s) ... Exhale (6s)
                    </p>
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
          }
      `}</style>
        </div>
    );
};

export default ReliefFlow;
