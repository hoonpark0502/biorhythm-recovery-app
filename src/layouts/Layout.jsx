import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const { userRole, logout, currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <header style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ color: 'var(--primary)', letterSpacing: '1px' }}>KICKOFF</h2>
                    <span style={{
                        fontSize: '0.8rem',
                        background: 'var(--bg-card)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase'
                    }}>
                        {userRole} Portal
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{currentUser?.displayName}</span>
                    <button onClick={handleLogout} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        Logout
                    </button>
                </div>
            </header>

            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
