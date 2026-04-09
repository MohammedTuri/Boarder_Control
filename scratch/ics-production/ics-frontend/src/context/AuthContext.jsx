import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // In a real app we would check expiration
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    const savedUser = JSON.parse(localStorage.getItem('user'));
                    setUser(savedUser);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (e) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (id, passcode) => {
        try {
            const res = await axios.post('/api/auth/login', { id, passcode });
            const { token, agent } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(agent));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(agent);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Login failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
