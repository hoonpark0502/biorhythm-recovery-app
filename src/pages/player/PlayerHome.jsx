import React, { useState } from 'react';

const PlayerHome = () => {
    const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'my-team'

    const [availableMatches, setAvailableMatches] = useState([
        { id: 1, stadium: 'Seoul World Cup Stadium', time: '14:00', price: 100, teamDetails: 'Semi-Pro Level', recruiting: true, currentPlayers: 8, maxPlayers: 11 },
        { id: 2, stadium: 'Jamsil Arena', time: '16:00', price: 120, teamDetails: 'Casual Fun', recruiting: true, currentPlayers: 5, maxPlayers: 11 },
        { id: 3, stadium: 'Gangnam Futsal', time: '18:00', price: 150, teamDetails: 'Serious League', recruiting: false, currentPlayers: 11, maxPlayers: 11 },
    ]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('matches')}
                    className={activeTab === 'matches' ? 'btn-primary' : 'btn-ghost'}
                >
                    Match Recruitment
                </button>
                <button
                    onClick={() => setActiveTab('my-team')}
                    className={activeTab === 'my-team' ? 'btn-primary' : 'btn-ghost'}
                >
                    My Team & Stats
                </button>
            </div>

            {activeTab === 'matches' && (
                <>
                    <h1 style={{ marginBottom: '1.5rem' }}>This Week's Open Matches</h1>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {availableMatches.filter(m => m.recruiting).map(match => (
                            <div key={match.id} className="glass-panel" style={{
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{
                                            background: 'var(--primary)',
                                            color: 'black',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem'
                                        }}>
                                            RECRUITING
                                        </span>
                                        <h3 style={{ margin: 0 }}>{match.stadium}</h3>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Starts at {match.time} • $ {match.price} per team
                                    </p>
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                        {match.teamDetails} • <span style={{ color: 'var(--secondary)' }}>{match.currentPlayers}/{match.maxPlayers} Players</span>
                                    </p>
                                </div>

                                <button className="btn-ghost" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                                    Join Match
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'my-team' && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    {/* Placeholder for next step */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h2>My Team Info</h2>
                        <p>Team Rating and Stats will appear here.</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PlayerHome;
