import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('cp360_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('cp360_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier, password) {
    const res = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('cp360_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('cp360_token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('cp360_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
/* eslint-enable react-refresh/only-export-components */