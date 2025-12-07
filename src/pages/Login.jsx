import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (role) => {
        login(role);
        navigate(`/${role}`);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            position: 'relative',
            zIndex: 1
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                    KICKOFF
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    The Premier Amateur Soccer Platform
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '800px' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>Select Your Role</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>

                    {/* Player Card */}
                    <button
                        onClick={() => handleLogin('player')}
                        className="role-card"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--glass-border)',
                            padding: '2rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>⚽</div>
                        <h3 style={{ color: 'white' }}>Player</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Find games & Join teams</p>
                    </button>

                    {/* Referee Card */}
                    <button
                        onClick={() => handleLogin('referee')}
                        className="role-card"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--glass-border)',
                            padding: '2rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>⚖️</div>
                        <h3 style={{ color: 'white' }}>Referee</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Officiate & Earn</p>
                    </button>

                    {/* Owner Card */}
                    <button
                        onClick={() => handleLogin('owner')}
                        className="role-card"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--glass-border)',
                            padding: '2rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>🏟️</div>
                        <h3 style={{ color: 'white' }}>Stadium</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage Bookings</p>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Login;
