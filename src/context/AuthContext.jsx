import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'player', 'referee', 'owner'
    const [loading, setLoading] = useState(true);

    // MOCK LOGIN FOR DEVELOPMENT without valid Firebase Config
    const mockLogin = (role) => {
        const mockUser = {
            uid: `mock_${role}_123`,
            email: `${role}@test.com`,
            displayName: role === 'owner' ? 'Stadium Owner' : role === 'referee' ? 'Head Referee' : 'Striker Kim',
        };
        setCurrentUser(mockUser);
        setUserRole(role);
        localStorage.setItem('mockRole', role);
    };

    const logout = async () => {
        // await signOut(auth);
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem('mockRole');
    };

    useEffect(() => {
        // Check for mock session
        const storedRole = localStorage.getItem('mockRole');
        if (storedRole) {
            mockLogin(storedRole);
        }
        setLoading(false);
    }, []);

    const value = {
        currentUser,
        userRole,
        login: mockLogin, // using mock for now
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
