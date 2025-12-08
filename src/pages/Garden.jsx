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
    const { profile, garden, throwObject } = useStorage();
    const [isShopOpen, setIsShopOpen] = useState(false);

    // Day/Night Cycle (Manual Toggle for UX)
    const [isNight, setIsNight] = useState(true);

    const handleThrow = (type) => {
        const item = OBJECTS[type];
        if (confirm(`Throw ${item.name} into the river? (${item.cost} tokens)`)) {
            const success = throwObject(type, item.cost);
            if (success) {
                // Future: Trigger animation here
            }
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0F172A' }}>

            {/* 3D RIVER SCENE */}
            <RiverScene isNight={isNight}>
                <StarSystem items={garden} isNight={isNight} />
            </RiverScene>

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
