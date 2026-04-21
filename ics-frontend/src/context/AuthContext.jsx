import React, { createContext, useState, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ics_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('ics_token');
  });

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('ics_user', JSON.stringify(userData));
    localStorage.setItem('ics_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ics_user');
    localStorage.removeItem('ics_token');
  };

  // Helper for authenticated fetches
  const authFetch = async (url, options = {}) => {
    // Prepend API_BASE_URL if URL is relative (doesn't start with http/https)
    const normalizedUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(normalizedUrl, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
