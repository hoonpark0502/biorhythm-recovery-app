import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { useAuth } from '../context/AuthContext';
import VisitGarden from '../components/VisitGarden';
import TreeScene from '../components/ThreeGarden/TreeScene';

const ORNAMENTS = {
    red_ball: { name: 'Red Ball', cost: 0.5, icon: '🔴' },
    blue_ball: { name: 'Blue Ball', cost: 0.5, icon: '🔵' },
    gold_star: { name: 'Gold Star', cost: 1.0, icon: '⭐' },
    lights: { name: 'Fairy Lights', cost: 2.0, icon: '💡' }
};

const Garden = ({ onBack }) => {
    const { profile, garden, buyOrnament } = useStorage();
    const { user } = useAuth();
    const [isShopOpen, setIsShopOpen] = useState(false);

    const handleBuy = (type) => {
        const item = ORNAMENTS[type];
        if (confirm(`Buy ${item.name} for ${item.cost} tokens?`)) {
            // Generate Random Position on Tree Surface (Local Coordinates)
            // Tree is roughly a cone from Y=0 to Y=3, Radius 1.2 to 0
            const height = Math.random() * 3.0; // 0 to 3.0
            const maxRadius = 1.2 * (1 - height / 3.0);
            const radius = maxRadius * 0.9; // Slightly inside/surface
            const angle = Math.random() * Math.PI * 2;

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = height;

            // Add offset for the stacked cones visuals if needed, but simple cone approx is fine for decorations
            // We might shift Y up slightly so ornaments aren't in the trunk. The tree group starts at Y=-1.
            // The foliage starts at roughly Y=0 relative to group.

            const success = buyOrnament(type, item.cost, [x, y, z]);
            if (success) {
                // optional feedback?
            }
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0F172A' }}>

            {/* 3D SCENE BACKGROUND */}
            <TreeScene />

            {/* HEADER UI (Absolute) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto' }}>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                </div>

                <div style={{ pointerEvents: 'auto', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '10px 20px', borderRadius: '20px', color: 'white', textAlign: 'right', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{profile.tokens} 🪙</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{garden.length} Ornaments</div>
                </div>
            </div>

            {/* BOTTOM UI (Absolute) */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 10, pointerEvents: 'none', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* Visit Logic (Collapsible?) */}
                {!isShopOpen && (
                    <div style={{ pointerEvents: 'auto', marginBottom: '10px' }}>
                        {/* We can integrate VisitGarden in a modal or separate drawer. For now, keep it simple. */}
                        <button onClick={() => alert("Social feature coming to 3D soon!")} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.8)', border: 'none', color: 'white', fontWeight: 'bold', backdropFilter: 'blur(5px)', cursor: 'pointer' }}>
                            🌏 Visit Neighbors (Social)
                        </button>
                    </div>
                )}

                {/* SHOP TOGGLE / PANEL */}
                <div style={{ pointerEvents: 'auto', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '20px', boxShadow: '0 -5px 20px rgba(0,0,0,0.3)', transition: 'transform 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: '#333' }}>🎄 Ornament Shop</h3>
                        <button onClick={() => setIsShopOpen(!isShopOpen)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                            {isShopOpen ? '▼' : '▲'}
                        </button>
                    </div>

                    {isShopOpen && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', animation: 'fadeIn 0.3s' }}>
                            {Object.entries(ORNAMENTS).map(([key, item]) => (
                                <button
                                    key={key}
                                    onClick={() => handleBuy(key)}
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
                                    <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{item.icon}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{item.cost} 🪙</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {!isShopOpen && (
                        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }} onClick={() => setIsShopOpen(true)}>
                            Tap to Open Shop
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Garden;
