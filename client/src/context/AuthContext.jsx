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

 
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        //  Nếu đã có user → dùng luôn, khong gọi API
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          const parsedUser = JSON.parse(rawUser);
          if (mounted) setUser(parsedUser);
          return;
        }

        //  Chỉ khi reload / chưa login mới gọi refresh + profile
        const refreshRes = await authApi.refreshToken();
        if (refreshRes?.accessToken) {
          setAccessToken(refreshRes.accessToken);
        }

        const profileRes = await userApi.getProfile();
        const currentUser = profileRes.user || profileRes;

        if (!mounted) return;
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('isLoggedIn', 'true');
      } catch (err) {
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


  useEffect(() => {
    const onLogin = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    };

    const onLogout = () => setUser(null);

    const onUpdate = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) setUser(JSON.parse(raw));
      } catch { }
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

  
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.isRefreshFailed) {
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
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
    localStorage.setItem('user', JSON.stringify(currentUser));
    localStorage.setItem('isLoggedIn', 'true');
    window.dispatchEvent(new Event('userLogin'));

    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch { }

    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    window.dispatchEvent(new Event('userLogout'));
    navigate('/');
  }, [navigate]);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('userUpdate'));
  }, []);

  const changePassword = useCallback((currentPassword, newPassword) => {
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
