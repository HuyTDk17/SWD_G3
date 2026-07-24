import { useState, useEffect, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import authService from '../services/authService';
import { clearAccessToken } from '../api/axiosClient';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const result = await authService.refresh();
        if (mounted) setUser(result.user);
      } catch {
        if (mounted) {
          clearAccessToken();
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      clearAccessToken();
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (payload) => {
    const result = await authService.login(payload);
    setUser(result.user);
    return result;
  };

  const googleLogin = async (credential) => {
    const result = await authService.googleLogin(credential);
    setUser(result.user);
    return result;
  };

  const register = async (payload) => authService.register(payload);
  const verifyOtp = async (payload) => authService.verifyOtp(payload);
  const resendOtp = async (payload) => authService.resendOtp(payload);
  const forgotPassword = async (payload) => authService.forgotPassword(payload);
  const resetPassword = async (payload) => authService.resetPassword(payload);
  const updateUser = (nextUser) => setUser(nextUser);

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    googleLogin,
    logout,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    updateUser
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
