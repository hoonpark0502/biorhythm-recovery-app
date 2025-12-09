import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import RiverScene from '../components/ThreeGarden/RiverScene';
import StarSystem from '../components/ThreeGarden/StarSystem';

const OBJECTS = {
    pebble: { name: 'Small Pebble', cost: 0.2, icon: '🪨', desc: 'A nice little thought' },
    stone: { name: 'Heavy Stone', cost: 0.5, icon: '🌑', desc: 'A heavy burden' },
    branch: { name: 'Old Branch', cost: 1.0, icon: '🪵', desc: 'Letting go of the past' }
};

const Garden = ({ onBack }) => {
    const { profile, garden, throwObject, trackGardenVisit } = useStorage();
    const [isShopOpen, setIsShopOpen] = useState(false);

    // Track visit
    React.useEffect(() => {
        trackGardenVisit();
    }, []);

    // Day/Night Cycle (Manual Toggle for UX)
    const [isNight, setIsNight] = useState(true);

    // Animation State
    const [throwingState, setThrowingState] = useState(null); // { type, step: 'idle'|'windup'|'throw' }
    const [selectedStar, setSelectedStar] = useState(null);

    const handleThrow = (type) => {
        const item = OBJECTS[type];
        if (confirm(`Throw ${item.name} into the river? (${item.cost} tokens)`)) {
            // Start Animation Sequence
            setThrowingState({ type, step: 'windup' });

            // 1. Windup (Character appears)
            setTimeout(() => {
                setThrowingState({ type, step: 'throw' });

                // 2. Real Logic execute
                setTimeout(() => {
                    const success = throwObject(type, item.cost);
                    if (success) {
                        // 3. Reset after splash
                        setTimeout(() => setThrowingState(null), 2000);
                    }
                }, 500); // Wait for "throw" frame
            }, 800);
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0F172A' }}>

            {/* 3D RIVER SCENE */}
            <RiverScene isNight={isNight}>
                <StarSystem items={garden} isNight={isNight} onSelectStar={setSelectedStar} />
            </RiverScene>

            {/* THROWING ANIMATION OVERLAY (2D Billboard Style) */}
            {throwingState && (
                <div style={{
                    position: 'absolute',
                    bottom: '150px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 20,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {/* Character Sprite */}
                    <img
                        src="/cute_helper_character.png"
                        alt="Character"
                        style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))',
                            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            transform: throwingState.step === 'windup' ? 'scale(1.1) rotate(-10deg)' : 'scale(1.0) translateY(-20px) rotate(20deg)'
                        }}
                    />

                    {/* Projectile (css animation) */}
                    {throwingState.step === 'throw' && (
                        <div style={{
                            fontSize: '3rem',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            animation: 'toss 1s forwards ease-in-out'
                        }}>
                            {OBJECTS[throwingState.type].icon}
                            <style>{`
                                @keyframes toss {
                                    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                                    50% { transform: translate(-50%, -200px) scale(0.8); }
                                    100% { transform: translate(-50%, 100px) scale(0); opacity: 0; }
                                }
                             `}</style>
                        </div>
                    )}
                </div>
            )}

            {/* STAR DETAIL MODAL */}
            {selectedStar && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.6)', zIndex: 100,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    animation: 'fadeIn 0.2s'
                }} onClick={() => setSelectedStar(null)}>
                    <div style={{
                        background: '#1e293b', padding: '30px', borderRadius: '24px',
                        border: '1px solid #334155', maxWidth: '300px', width: '90%',
                        textAlign: 'center', color: 'white',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                            {selectedStar.originType === 'pebble' ? '🪨' :
                                selectedStar.originType === 'stone' ? '🌑' :
                                    selectedStar.originType === 'branch' ? '🪵' : '⭐'}
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#fbbf24' }}>Star Detail</h3>
                        <p style={{ opacity: 0.8, marginBottom: '20px' }}>
                            This star was born from a <strong>{selectedStar.originType || 'thought'}</strong> you let go on <br />
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{new Date(selectedStar.plantedAt).toLocaleString()}</span>
                        </p>
                        <button onClick={() => setSelectedStar(null)} style={{
                            padding: '10px 20px', background: '#3b82f6', border: 'none',
                            borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer'
                        }}>Close</button>
                    </div>
                </div>
            )}


            {/* HEADER UI */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto' }}>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                </div>

                <div style={{ pointerEvents: 'auto', display: 'flex', gap: '10px' }}>
                    {/* Time Toggle */}
                    <button onClick={() => setIsNight(!isNight)} style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '5px 15px', color: 'white', cursor: 'pointer' }}>
                        {isNight ? '🌙 Night' : '☀️ Day'}
                    </button>

                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '20px', color: 'white', textAlign: 'right', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{profile.tokens} 🪙</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{garden.length} Stars</div>
                    </div>
                </div>
            </div>

            {/* BOTTOM UI (Object Shop) */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 10, pointerEvents: 'none', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* SHOP PANEL */}
                <div style={{ pointerEvents: 'auto', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '20px', boxShadow: '0 -5px 20px rgba(0,0,0,0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: '#333' }}>🌊 River of Thoughts</h3>
                        <button onClick={() => setIsShopOpen(!isShopOpen)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                            {isShopOpen ? '▼' : '▲'}
                        </button>
                    </div>

                    {isShopOpen && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', animation: 'fadeIn 0.3s' }}>
                            {Object.entries(OBJECTS).map(([key, item]) => (
                                <button
                                    key={key}
                                    onClick={() => handleThrow(key)}
                                    disabled={profile.tokens < item.cost}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        padding: '12px', borderRadius: '12px',
                                        border: '1px solid #ddd',
                                        background: profile.tokens >= item.cost ? 'white' : '#f5f5f5',
                                        opacity: profile.tokens >= item.cost ? 1 : 0.6,
                                        cursor: profile.tokens >= item.cost ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <span style={{ fontSize: '2rem', marginBottom: '4px' }}>{item.icon}</span>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#888' }}>{item.desc}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#0066cc', marginTop: '4px' }}>{item.cost} 🪙</div>
                                </button>
                            ))}
                        </div>
                    )}
                    {!isShopOpen && (
                        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }} onClick={() => setIsShopOpen(true)}>
                            Throw something into the river...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Garden;
