import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import RiverScene from '../components/ThreeGarden/RiverScene';
import ThoughtObject from '../components/ThreeGarden/ThoughtObject';

const Garden = ({ onBack }) => {
    const { profile, garden, throwObject, trackGardenVisit } = useStorage();
    const [isNight, setIsNight] = useState(true);
    const [animatingItems, setAnimatingItems] = useState([]); // Items currently being thrown

    // Track visit
    React.useEffect(() => {
        trackGardenVisit();
    }, []);

    const handleBuy = (type) => {
        // Shop Costs
        let cost = 0.5;
        let visualKind = 'cup';

        if (type === 'pebble') { cost = 0.5; visualKind = 'cup'; }
        if (type === 'stone') { cost = 1.0; visualKind = 'book'; }
        if (type === 'branch') { cost = 2.0; visualKind = 'clock'; }

        if (profile.tokens < cost) {
            alert(`Not enough tokens! Need ${cost} 🪙`);
            return;
        }

        if (confirm(`Throw this thought? (${cost} tokens)`)) {
            const success = throwObject(type, cost);
            if (success) {
                // Trigger Animation
                const newItem = {
                    id: Date.now(),
                    kind: visualKind,
                    start: [0, 1.5, 3], // Start near camera/bridge
                    riverTarget: [0, 0.2, 0],
                    skyTarget: [0, 10, -10]
                };
                setAnimatingItems(prev => [...prev, newItem]);

                // Remove from animation list after few seconds (when animation done)
                setTimeout(() => {
                    setAnimatingItems(prev => prev.filter(i => i.id !== newItem.id));
                }, 8000);
            }
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* Main 3D Scene */}
            <RiverScene isNight={isNight}>

                {/* 1. Animating Items (Just Bought) */}
                {animatingItems.map(item => (
                    <ThoughtObject
                        key={item.id}
                        kind={item.kind}
                        color="#ffffff"
                        start={[0, 1, 2]} // Bridge position
                        riverTarget={[0, 0.2, 0]}
                        skyTarget={[(Math.random() * 10) - 5, 8, -5]}
                        autoThrow={true} // Trigger animation immediately
                    />
                ))}

                {/* 2. Planted Stars from Storage */}
                {(garden || []).map((item, i) => {
                    if (!item) return null;
                    // Map internal types to visual kinds
                    let kind = 'cup';
                    let color = '#9fd3ff';
                    if (item.originType === 'stone') { kind = 'book'; color = '#ffb36b'; }
                    if (item.originType === 'branch') { kind = 'clock'; color = '#ffe27a'; }

                    // Validate Position (Legacy data safeguard)
                    const rawPos = (item.position && Array.isArray(item.position)) ? item.position : [0, 0, 0];

                    const skyPos = [
                        rawPos[0],
                        Math.abs(rawPos[1]) + 5,
                        rawPos[2] - 5
                    ];

                    return (
                        <ThoughtObject
                            key={item.id}
                            kind={kind}
                            color={color}
                            skyTarget={skyPos}
                            isPlanted={true}
                        />
                    );
                })}
            </RiverScene>

            {/* UI Overlay: Top Bar */}
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                <button onClick={onBack} style={{
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
                    border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                    color: 'white', fontSize: '1.2rem', cursor: 'pointer'
                }}>←</button>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setIsNight(!isNight)} style={{
                        background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '8px 16px',
                        color: 'white', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer'
                    }}>
                        {isNight ? '🌙 Night' : '☀️ Day'}
                    </button>
                    <div style={{
                        background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '20px',
                        color: 'white', fontWeight: 'bold', backdropFilter: 'blur(5px)'
                    }}>
                        🪙 {profile.tokens}
                    </div>
                </div>
            </div>

            {/* UI Overlay: Shop (Bottom) */}
            <div style={{
                position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                borderRadius: '20px', padding: '15px 25px', display: 'flex', gap: '20px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <ShopItem kind="pebble" cost={0.5} label="Pebble Needs" onClick={() => handleBuy('pebble')} />
                <ShopItem kind="stone" cost={1.0} label="Stone Worries" onClick={() => handleBuy('stone')} />
                <ShopItem kind="branch" cost={2.0} label="Branch Stress" onClick={() => handleBuy('branch')} />
            </div>
        </div>
    );
};

const ShopItem = ({ kind, cost, label, onClick }) => (
    <div onClick={onClick} style={{ textAlign: 'center', cursor: 'pointer', color: 'white' }}>
        <div style={{
            width: '50px', height: '50px', background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem'
        }}>
            {kind === 'pebble' && '🧂'}
            {kind === 'stone' && '🪨'}
            {kind === 'branch' && '🪵'}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{label}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fbbf24' }}>{cost} 🪙</div>
    </div>
);

export default Garden;
