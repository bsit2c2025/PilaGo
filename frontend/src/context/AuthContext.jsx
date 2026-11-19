import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pilago_user');
    const token = localStorage.getItem('pilago_access_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user cache', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    localStorage.setItem('pilago_access_token', res.data.access);
    localStorage.setItem('pilago_refresh_token', res.data.refresh);
    localStorage.setItem('pilago_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('pilago_access_token');
    localStorage.removeItem('pilago_refresh_token');
    localStorage.removeItem('pilago_user');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/users/profile/');
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem('pilago_user', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to refresh profile', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
