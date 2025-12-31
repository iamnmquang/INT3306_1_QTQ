import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import Modal from '../common/Modal';

export default function UserManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'USER', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll();
      setList(data);
    } catch (err) { console.error(err); alert('Lỗi tải người dùng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm({ name: '', email: '', role: 'USER', password: '' }); setShowModal(true); };
  const openEdit = (u) => { setEditingId(u.id); setForm({ name: u.name, email: u.email, role: u.role || 'USER', password: '' }); setShowModal(true); };

  const submit = async (e) => {
    e && e.preventDefault();
    if (!form.name || !form.email) return alert('Tên và email là bắt buộc');
    try {
      if (editingId) {
        await userApi.update(editingId, form);
      } else {
        await userApi.create(form);
      }
      setForm({ name: '', email: '', role: 'USER', password: '' });
      setEditingId(null);
      setShowModal(false);
      load();
    } catch (err) { console.error(err); alert('Lỗi lưu người dùng'); }
  };

  const remove = async (id) => { if (!confirm('Xác nhận xóa người dùng?')) return; try { await userApi.delete(id); load(); } catch (err) { console.error(err); alert('Lỗi xóa'); } };

  const filtered = list.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
              Quản lý người dùng
            </h1>
            <p className="text-slate-600">
              Tổng cộng {list.length} người dùng
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            + Tạo người dùng
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <input
            className="w-full p-3 border rounded-lg"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4">Người dùng</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      Không tìm thấy người dùng
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div className="font-medium text-slate-900">
                            {u.name}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {u.email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium
                          ${u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                            }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button
                          className="text-slate-600 hover:text-slate-900"
                          onClick={() => setViewUser(u)}
                        >
                          Xem
                        </button>
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => openEdit(u)}
                        >
                          Sửa
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => remove(u.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Create / Edit */}
        <Modal
          title={editingId ? 'Sửa người dùng' : 'Tạo người dùng'}
          open={showModal}
          onClose={() => setShowModal(false)}
          footer={(
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={submit}
              >
                {editingId ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          )}
        >
          <form className="space-y-3" onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="p-2 border rounded"
                placeholder="Họ tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="p-2 border rounded"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <select
                className="p-2 border rounded"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <input
                className="p-2 border rounded"
                placeholder="Password (chỉ khi tạo mới)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </form>
        </Modal>

        {/* Modal View */}
        <Modal
          title={viewUser?.name || 'Người dùng'}
          open={!!viewUser}
          onClose={() => setViewUser(null)}
          footer={(
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setViewUser(null)}
              >
                Đóng
              </button>
            </div>
          )}
        >
          {viewUser && (
            <div className="space-y-2">
              <div><strong>Họ tên:</strong> {viewUser.name}</div>
              <div><strong>Email:</strong> {viewUser.email}</div>
              <div><strong>Vai trò:</strong> {viewUser.role}</div>
              <div>
                <strong>Avatar:</strong>{' '}
                {viewUser.avatarUrl
                  ? <img src={viewUser.avatarUrl} alt="avatar" className="w-24 h-24 rounded mt-2" />
                  : 'Không có'}
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );

}