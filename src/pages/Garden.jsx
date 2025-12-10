import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import RiverScene from '../components/ThreeGarden/RiverScene';
import ThoughtObject from '../components/ThreeGarden/ThoughtObject';

const Garden = ({ onBack }) => {
    const { profile, garden, throwObject, trackGardenVisit } = useStorage();

    // Track visit
    React.useEffect(() => {
        trackGardenVisit();
    }, []);

    const handleThrow = (type) => {
        const costs = { cup: 5, book: 15, clock: 30 }; // Example costs? Or dynamic? 
        // User code had hardcoded types: cup, book, clock.
        // My previous code had: pebble(0.2), stone(0.5), branch(1.0).
        // Let's map them for compatibility or define new ones.
        // Let's assume standard costs for these new "Special" items.
        // Cup (Simple) = 5, Book (Knowledge) = 10, Clock (Time) = 20? 
        // Logic: Try to throw.

        // Actually, let's keep it simple. Just allow throwing if they have tokens.
        // But I need to know the COST. 
        // Let's stick to the old costs but visual mapping:
        // Cup -> Pebble (Cheapest)
        // Book -> Stone (Medium)
        // Clock -> Branch (Expensive)

        let cost = 1;
        let internalKind = 'pebble';

        if (type === 'cup') { cost = 1; internalKind = 'pebble'; }
        if (type === 'book') { cost = 3; internalKind = 'stone'; }
        if (type === 'clock') { cost = 5; internalKind = 'branch'; }

        if (profile.tokens < cost) {
            alert(`Not enough tokens! Need ${cost} 🪙`);
            return false;
        }

        if (confirm(`Throw this thought? (${cost} tokens)`)) {
            return throwObject(internalKind, cost);
        }
        return false;
    };

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* Main 3D Scene */}
            <RiverScene>
                {/* 1. Floating Shop Items (Interactive) */}
                <ThoughtObject
                    kind="cup"
                    color="#9fd3ff"
                    start={[0.5, 1.2, 0]}
                    riverTarget={[0, 0.2, 0]}
                    skyTarget={[2, 6, -5]}
                    onThrow={handleThrow}
                />
                <ThoughtObject
                    kind="book"
                    color="#ffb36b"
                    start={[0, 1.5, 0.6]}
                    riverTarget={[0, 0.2, 0]}
                    skyTarget={[-4, 7, -8]}
                    onThrow={handleThrow}
                />
                <ThoughtObject
                    kind="clock"
                    color="#ffe27a"
                    start={[-0.6, 1.3, -0.3]}
                    riverTarget={[0, 0.2, 0]}
                    skyTarget={[5, 8, -6]}
                    onThrow={handleThrow}
                />

                {/* 2. Planted Stars from Storage */}
                {(garden || []).map((item, i) => {
                    // Map internal types to visual kinds
                    let kind = 'cup';
                    let color = '#9fd3ff';
                    if (item.originType === 'stone') { kind = 'book'; color = '#ffb36b'; }
                    if (item.originType === 'branch') { kind = 'clock'; color = '#ffe27a'; }

                    // Generate a deterministic sky position based on ID or index
                    // In user code, skyTarget was separate.
                    // Here we need to position them in the sky.
                    // Let's use the random 'position' stored in 'item.position' if possible,
                    // but 'item.position' from previous logic was likely low values.
                    // We need Sky Values (Y > 5).

                    // Use stored position but offset Y to sky level
                    const skyPos = [
                        item.position[0],
                        Math.abs(item.position[1]) + 5, // Ensure above horizon
                        item.position[2] - 5 // Push back a bit
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

            {/* UI Overlay: Back Button & Token Count */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                <button onClick={onBack} style={{
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
                    border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                    color: 'white', fontSize: '1.2rem', cursor: 'pointer'
                }}>←</button>
            </div>

            <div style={{
                position: 'absolute', top: 20, right: 20, zIndex: 10,
                background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '20px',
                color: 'white', fontWeight: 'bold', backdropFilter: 'blur(5px)'
            }}>
                🪙 {profile.tokens}
            </div>

            <div style={{
                position: 'absolute', bottom: 30, width: '100%', textAlign: 'center',
                color: 'white', opacity: 0.8, pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
                Click a floating object to throw your thought away
            </div>
        </div>
    );
};

export default Garden;
