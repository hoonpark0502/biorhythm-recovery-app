import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';

const PLANT_TYPES = {
    sunflower: { name: 'Sunflower', cost: 0.5, icon: '🌻', stages: ['🌰', '🌱', '🌿', '🌻'] },
    rose: { name: 'Rose', cost: 0.8, icon: '🌹', stages: ['🌰', '🌱', '🌿', '🌹'] },
    tree: { name: 'Oak Tree', cost: 1.5, icon: '🌳', stages: ['🌰', '🌱', '🌳', '🍎'] }
};

const Garden = ({ onBack }) => {
    const { profile, garden, buyPlant } = useStorage();

    const handleBuy = (type) => {
        if (confirm(`Buy ${PLANT_TYPES[type].name} seed for ${PLANT_TYPES[type].cost} tokens?`)) {
            buyPlant(type, PLANT_TYPES[type].cost);
        }
    };

    return (
        <div className="page-container fade-in" style={{ padding: '24px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={onBack} style={{ fontSize: '1.5rem', background: 'transparent', marginRight: '16px', border: 'none', cursor: 'pointer' }}>←</button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>My Mind Garden</h1>
            </div>

            {/* HEADER stats */}
            <div style={{ background: '#FFF4E6', padding: '20px', borderRadius: '16px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#D97706', fontSize: '1.2rem' }}>{profile.tokens} 🪙</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#b45309' }}>Available Tokens</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem' }}>{garden.length}</div>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#b45309' }}>Plants</p>
                </div>
            </div>

            {/* GARDEN GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                {garden.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999', background: '#f9f9f9', borderRadius: '12px' }}>
                        Your garden is empty.<br />Buy a seed to start! 🌱
                    </div>
                )}
                {garden.map((plant) => {
                    const info = PLANT_TYPES[plant.type] || PLANT_TYPES.sunflower;
                    const stageIcon = info.stages[Math.min(plant.stage, info.stages.length - 1)];
                    return (
                        <div key={plant.id} style={{
                            aspectRatio: '1',
                            background: 'white',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-card)',
                            position: 'relative'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>{stageIcon}</div>
                            {plant.stage < 3 && (
                                <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '4px' }}>Growing...</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* SHOP */}
            <h3 style={{ marginBottom: '16px' }}>Seed Shop</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(PLANT_TYPES).map(([key, info]) => (
                    <div key={key} style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '1.5rem' }}>{info.stages[3]}</div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{info.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Grows via routines</div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleBuy(key)}
                            disabled={profile.tokens < info.cost}
                            style={{
                                background: profile.tokens >= info.cost ? 'var(--color-primary)' : '#eee',
                                color: profile.tokens >= info.cost ? 'white' : '#999',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: profile.tokens >= info.cost ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {info.cost} 🪙
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Garden;
