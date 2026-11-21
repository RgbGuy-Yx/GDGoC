import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, leadLogin, getMe } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('gdgoc_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('gdgoc_token'));
  const [loading, setLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('gdgoc_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMe();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('gdgoc_user', JSON.stringify(response.data.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Unified login for organiser or team lead
   * @param {string} accessCode 
   * @param {'admin'|'lead'} roleMode 
   */
  const login = async (accessCode, roleMode = 'lead') => {
    const trimmedCode = accessCode ? accessCode.trim() : '';
    if (!trimmedCode) {
      throw new Error('Please enter an access code.');
    }

    const authResponse = roleMode === 'admin'
      ? await adminLogin(trimmedCode)
      : await leadLogin(trimmedCode);

    if (authResponse && authResponse.success && authResponse.data) {
      const { token: receivedToken, user: receivedUser } = authResponse.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('gdgoc_token', receivedToken);
      localStorage.setItem('gdgoc_user', JSON.stringify(receivedUser));
      return receivedUser;
    }

    throw new Error('Authentication failed. No token received.');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gdgoc_token');
    localStorage.removeItem('gdgoc_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isLead: user?.role === 'lead'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
