// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAccessToken } from '../api/axios';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Initialize session: attempt refresh -> fetch profile
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        // Try to get a new access token using refresh token cookie
        const refreshRes = await authApi.refreshToken();
        if (refreshRes?.accessToken) {
          setAccessToken(refreshRes.accessToken);
        }

        // Fetch the current profile (server may return { user } or the user object)
        const profileRes = await userApi.getProfile();
        const currentUser = profileRes.user || profileRes;

        if (!mounted) return;
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('isLoggedIn', 'true');
      } catch (err) {
        // If refresh fails, clear local session
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Keep state in sync across tabs/windows
  useEffect(() => {
    const onLogin = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    };

    const onLogout = () => {
      setUser(null);
    };

    const onUpdate = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
      } catch {
        // ignore
      }
    };

    window.addEventListener('userLogin', onLogin);
    window.addEventListener('userLogout', onLogout);
    window.addEventListener('userUpdate', onUpdate);

    return () => {
      window.removeEventListener('userLogin', onLogin);
      window.removeEventListener('userLogout', onLogout);
      window.removeEventListener('userUpdate', onUpdate);
    };
  }, []);

  // Register interceptor to force logout when refresh fails
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.isRefreshFailed) {
          // cleanup local session and navigate to login
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('userLogout'));
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [navigate]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    const accessToken = data.accessToken || data.token || null;
    const currentUser = data.user || data;

    if (accessToken) setAccessToken(accessToken);
    setUser(currentUser);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(currentUser));
    window.dispatchEvent(new Event('userLogin'));

    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // ignore errors on logout
    }

    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  }, [navigate]);

  // Update user locally (and notify other components)
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('userUpdate'));
  }, []);

  // Use userApi for changing password (authenticated flow)
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return userApi.changePassword(currentPassword, newPassword);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAuthenticated: !!user,
      updateUser,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};