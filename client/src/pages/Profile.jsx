import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';

export default function Profile() {
  const { user, updateUser, changePassword } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Fetch latest profile when page mounts
  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const res = await userApi.getProfile();
        const profile = res.user || res;
        if (!mounted) return;
        setName(profile.name || '');
        setEmail(profile.email || '');
        // sync global user too
        if (profile) updateUser(profile);
      } catch (err) {
        // ignore – user may be already in state
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await userApi.updateProfile({ name, email });

      // server may return updated user object or payload wrapper
      const updatedUser = res.user || res;
      updateUser(updatedUser);
      alert('Profile updated successfully ✅');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Update failed';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    try {
      setPwLoading(true);
      await changePassword(email, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed successfully ✅');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Change password failed';
      alert(msg);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-4">Account info</h2>

        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Name</span>
            <input
              className="mt-1 border px-3 py-2 rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Email</span>
            <input
              className="mt-1 border px-3 py-2 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <div className="pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>

      <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-lg font-medium mb-4">Change password</h2>

        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Current password</span>
            <input
              type="password"
              className="mt-1 border px-3 py-2 rounded-md"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">New password</span>
            <input
              type="password"
              className="mt-1 border px-3 py-2 rounded-md"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Confirm new password</span>
            <input
              type="password"
              className="mt-1 border px-3 py-2 rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <div className="pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              disabled={pwLoading}
            >
              {pwLoading ? 'Changing...' : 'Change password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
