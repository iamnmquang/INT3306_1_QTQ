import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';

export default function Profile() {
  const { user, updateUser, changePassword } = useAuth();

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
        console.error('Load profile failed', err);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // ===== UPDATE PROFILE =====
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Backend chỉ cho phép: name, phone, address
      const res = await userApi.updateProfile({
        name,
        phone,
        address
      });

      const updatedUser = res.user || res;
      updateUser(updatedUser);

      alert('Cập nhật thông tin thành công ✅');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Cập nhật thất bại';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  // ===== CHANGE PASSWORD =====
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      alert('Vui lòng nhập đầy đủ mật khẩu');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới không khớp');
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

      alert('Đổi mật khẩu thành công ✅');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        'Đổi mật khẩu thất bại';
      alert(msg);
    } finally {
      setPwLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-6">

        {/* ===== HEADER ===== */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {name || 'User'}
              </h1>
              <p className="text-slate-600">{email}</p>
            </div>
          </div>
        </div>

        {/* ===== ACCOUNT INFO ===== */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">
            Thông tin tài khoản
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* NAME */}
            <div>
              <label className="text-sm text-slate-600">Họ và tên</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed"
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
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium disabled:opacity-70"
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
          <h2 className="text-lg font-semibold mb-4">
            Đổi mật khẩu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="text-sm text-slate-600">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">
                Mật khẩu mới
              </label>
              <input
                type="password"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={pwLoading}
              className="px-6 py-2 rounded-lg bg-slate-900 text-white font-medium disabled:opacity-70"
            >
              {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );

}
