import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaPending, setMfaPending] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('docshare_user');
    const token = localStorage.getItem('docshare_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Backend sends OTP and returns userId
      setPendingUserId(data.userId);
      setMfaPending(true);
      setLoading(false);
      return { mfaRequired: true };
    } catch (err) {
      setLoading(false);
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const verifyMfa = async (otp) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId: pendingUserId, otp });
      const { token, ...safeUser } = data;
      localStorage.setItem('docshare_token', token);
      localStorage.setItem('docshare_user', JSON.stringify(safeUser));
      setUser(safeUser);
      setMfaPending(false);
      setPendingUserId(null);
      setLoading(false);
      return true;
    } catch (err) {
      setLoading(false);
      throw new Error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const register = async ({ name, email, password, role }) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('docshare_user');
    localStorage.removeItem('docshare_token');
    toast.success('Logged out successfully');
  };

  const cancelMfa = () => {
    setMfaPending(false);
    setPendingUserId(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, mfaPending, login, verifyMfa, register, logout, cancelMfa }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
