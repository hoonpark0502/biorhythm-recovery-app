import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, limit, query, where, updateDoc, increment, doc } from 'firebase/firestore';

const PLANT_EMOJIS = {
    sunflower: '🌻',
    rose: '🌹',
    tree: '🌳'
};

const VisitGarden = ({ currentUserUid, onBack }) => {
    const [randomUser, setRandomUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [watered, setWatered] = useState(false);

    const findRandomGarden = async () => {
        setLoading(true);
        setRandomUser(null);
        setWatered(false);
        try {
            // MVP: Just get up to 10 users and pick one that isn't me
            const q = query(collection(db, "users"), limit(10));
            const snapshot = await getDocs(q);

            const users = [];
            snapshot.forEach(doc => {
                if (doc.id !== currentUserUid) {
                    users.push({ id: doc.id, ...doc.data() });
                }
            });

            if (users.length > 0) {
                const random = users[Math.floor(Math.random() * users.length)];
                setRandomUser(random);
            } else {
                alert("No other gardens found yet! (You might be the first explorer 🚀)");
            }
        } catch (e) {
            console.error("Error finding neighbors:", e);
            alert("Failed to find neighbors.");
        }
        setLoading(false);
    };

    const handleWater = async () => {
        if (!randomUser || watered) return;

        try {
            // "Watering" gives them 0.1 tokens (simple social interaction)
            // Realtime update to their doc
            const userRef = doc(db, "users", randomUser.id);
            await updateDoc(userRef, {
                "profile.tokens": increment(0.1) // Giving a gift
            });
            setWatered(true);
            alert(`You watered ${randomUser.profile?.name || 'Friend'}'s garden! They received 0.1 Token.`);
        } catch (e) {
            console.error("Error watering:", e);
            alert("Failed to water.");
        }
    };

    return (
        <div className="fade-in" style={{ padding: '20px', background: '#F0FDFA', borderRadius: '16px', border: '1px solid #CCFBF1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#0F766E' }}>🌏 Explore Neighbors</h3>
                {randomUser && <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>}
            </div>

            {!randomUser ? (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '16px' }}>
                        Visit other gardens and water their plants to spread kindness.
                    </p>
                    <button
                        onClick={findRandomGarden}
                        disabled={loading}
                        style={{ background: '#0D9488', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Searching...' : 'Visit Random Garden'}
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>{randomUser.profile?.name || 'Someone'}'s Garden</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', minHeight: '60px' }}>
                            {randomUser.garden && randomUser.garden.length > 0 ? (
                                randomUser.garden.map(plant => (
                                    <div key={plant.id} style={{ fontSize: '1.5rem', animation: 'pop 0.3s' }}>
                                        {PLANT_EMOJIS[plant.type] || '🌱'}
                                    </div>
                                ))
                            ) : (
                                <span style={{ color: '#999', fontSize: '0.9rem' }}>(Empty Garden)</span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleWater}
                        disabled={watered}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: 'none',
                            background: watered ? '#CFFAFE' : '#0EA5E9',
                            color: watered ? '#0C4A6E' : 'white',
                            fontWeight: 'bold',
                            cursor: watered ? 'default' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                        }}
                    >
                        {watered ? <span>✨ Watered!</span> : <span>💧 Water Plants (+Gift)</span>}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#aaa', marginTop: '8px' }}>Next exploration available anytime.</p>
                    <button onClick={findRandomGarden} style={{ width: '100%', marginTop: '8px', padding: '8px', background: 'transparent', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}>Next Garden →</button>
                </div>
            )}
        </div>
    );
};

export default VisitGarden;
