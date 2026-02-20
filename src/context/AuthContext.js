import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { AuthAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      // Optionally: fetch profile using token, for now decode minimal info
      setUser({ email: localStorage.getItem('email') || '' });
    }
  }, [token, user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await AuthAPI.login(email, password);
      // Expecting backend returns token and user object
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
        if (data.user.email) localStorage.setItem('email', data.user.email);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await AuthAPI.register(name, email, password);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err?.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <div style={{ padding: 24 }}>Please login to continue.</div>;
  }
  return children;
};
