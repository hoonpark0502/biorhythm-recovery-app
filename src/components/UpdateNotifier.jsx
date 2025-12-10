import React, { useEffect, useState } from 'react';

// Hardcoded current version - increment this when deploying new features!
const APP_VERSION = "1.0.1";
const CHECK_INTERVAL = 1000 * 60; // Check every 1 minute for faster debugging

const UpdateNotifier = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);

    const checkVersion = async () => {
        try {
            // Append timestamp to prevent caching of the version file itself
            const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
            if (!res.ok) return;

            const remote = await res.json();

            // Log for debugging
            console.log(`Version Check: Local=${APP_VERSION}, Remote=${remote.version}`);

            if (remote.version !== APP_VERSION) {
                console.log(`Update available: ${APP_VERSION} -> ${remote.version}`);
                setUpdateAvailable(true);
            }
        } catch (e) {
            console.warn("Update check failed", e);
        }
    };

    useEffect(() => {
        checkVersion();
        const interval = setInterval(checkVersion, CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            } catch (e) { console.log("SW unregister error", e); }
        }

        // Force reload from server, ignoring cache
        window.location.href = window.location.href;
        window.location.reload(true);
    };

    if (!updateAvailable) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '50px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideUp 0.5s ease-out'
        }}>
            <span style={{ fontSize: '1.2rem' }}>🚀</span>
            <span style={{ fontSize: '0.95rem' }}>New version available!</span>
            <button
                onClick={handleRefresh}
                style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginLeft: '8px'
                }}
            >
                Refresh
            </button>
            <style>{`
                @keyframes slideUp {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default UpdateNotifier;
