import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const StadiumHome = () => {
    const { currentUser } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [matches, setMatches] = useState([
        { id: 1, time: '14:00', status: 'booked', team: 'FC Rocket', price: 100 },
        { id: 2, time: '16:00', status: 'open', price: 120 },
        { id: 3, time: '18:00', status: 'open', price: 150 },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSlot, setNewSlot] = useState({ time: '20:00', price: 150 });

    const handleAddSlot = (e) => {
        e.preventDefault();
        const newMatch = {
            id: Date.now(),
            time: newSlot.time,
            status: 'open',
            price: parseInt(newSlot.price)
        };
        setMatches([...matches, newMatch].sort((a, b) => a.time.localeCompare(b.time)));
        setIsModalOpen(false);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Schedule Manager</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your stadium availability for {selectedDate}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: 'auto' }}
                    />
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        + Add Time Slot
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {matches.map(match => (
                    <div key={match.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', borderLeft: `4px solid ${match.status === 'booked' ? 'var(--primary)' : 'var(--text-secondary)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{match.time}</h2>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                background: match.status === 'booked' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                color: match.status === 'booked' ? 'var(--primary)' : 'var(--text-secondary)',
                                textTransform: 'uppercase'
                            }}>
                                {match.status}
                            </span>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Price</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>${match.price}</p>
                        </div>

                        {match.status === 'booked' ? (
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Booked By</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                                    <span>{match.team}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginTop: 'auto' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Waiting for reservation...</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Slot Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 100
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '400px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Slot</h2>
                        <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Time</label>
                                <input
                                    type="time"
                                    value={newSlot.time}
                                    onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Price ($)</label>
                                <input
                                    type="number"
                                    value={newSlot.price}
                                    onChange={(e) => setNewSlot({ ...newSlot, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StadiumHome;
