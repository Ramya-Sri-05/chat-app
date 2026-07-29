import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, getMe } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chatToken') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Rehydrate session on refresh
  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('chatToken');
      const storedUser = localStorage.getItem('chatUser');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Validate token is still good
          const res = await getMe();
          setUser(res.data.user);
          localStorage.setItem('chatUser', JSON.stringify(res.data.user));
        } catch (err) {
          localStorage.removeItem('chatToken');
          localStorage.removeItem('chatUser');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError('');
    try {
      const res = await loginUser({ email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('chatToken', newToken);
      localStorage.setItem('chatUser', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  const signup = useCallback(async (username, email, password) => {
    setAuthError('');
    try {
      const res = await registerUser({ username, email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('chatToken', newToken);
      localStorage.setItem('chatUser', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      // even if the API call fails, clear local session
      console.error('Logout API error:', err.message);
    } finally {
      localStorage.removeItem('chatToken');
      localStorage.removeItem('chatUser');
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, authError, login, signup, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;