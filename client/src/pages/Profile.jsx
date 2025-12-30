import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();

  // ===== PROFILE STATE =====
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [saving, setSaving] = useState(false);

  // ===== PASSWORD STATE =====
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // ===== NOTIFICATION STATE =====
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // ===== FETCH PROFILE =====
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const res = await userApi.getProfile();
        const profile = res.user || res;
        if (!mounted) return;

        setName(profile.name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setAddress(profile.address || '');

        updateUser(profile);
      } catch (err) {
        showNotification('error', 'Không tải được thông tin người dùng');
      }
    };

    loadProfile();
    return () => (mounted = false);
  }, []);

  // ===== UPDATE PROFILE =====
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const res = await userApi.updateProfile({
        name,
        phone,
        address
      });

      const updatedUser = res.user || res;
      updateUser(updatedUser);

      showNotification('success', 'Cập nhật thông tin thành công');
    } catch (err) {
      showNotification(
        'error',
        err?.response?.data?.message || 'Cập nhật thất bại'
      );
    } finally {
      setSaving(false);
    }
  };

  // ===== CHANGE PASSWORD =====
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      showNotification('warning', 'Vui lòng nhập đầy đủ mật khẩu');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('warning', 'Mật khẩu mới không khớp');
      return;
    }

    try {
      setPwLoading(true);

      await userApi.changePassword({
        oldPassword: currentPassword,
        newPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showNotification('success', 'Đổi mật khẩu thành công');
    } catch (err) {
      showNotification(
        'error',
        err?.response?.data?.message || 'Đổi mật khẩu thất bại'
      );
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 relative">
      {/* ===== NOTIFICATION ===== */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-white
              ${notification.type === 'success' && 'bg-emerald-500'}
              ${notification.type === 'error' && 'bg-red-500'}
              ${notification.type === 'warning' && 'bg-amber-500'}
            `}
          >
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <XCircle size={20} />}
            {notification.type === 'warning' && <AlertTriangle size={20} />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6">
        {/* ===== HEADER ===== */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-slate-500" />
                {name || 'User'}
              </h1>
              <p className="text-slate-600 flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-slate-400" />
                {email}
              </p>
            </div>
          </div>
        </div>

        {/* ===== ACCOUNT INFO ===== */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Thông tin tài khoản</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NAME */}
            <div>
              <label className="text-sm text-slate-600">Họ và tên</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-slate-100"
                value={email}
                disabled
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm text-slate-600">Số điện thoại</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="text-sm text-slate-600">Địa chỉ</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>

        {/* ===== CHANGE PASSWORD ===== */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="password"
              placeholder="Mật khẩu hiện tại"
              className="border rounded-lg px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="border rounded-lg px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              className="border rounded-lg px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              disabled={pwLoading}
              className="px-6 py-2 rounded-lg bg-slate-900 text-white"
            >
              {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
