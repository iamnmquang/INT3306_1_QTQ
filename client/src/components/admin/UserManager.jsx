import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/userApi';
import Modal from '../common/Modal';

export default function UserManager(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', role:'USER', password:'' });
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const load = async ()=>{
    setLoading(true);
    try{
      const data = await userApi.getAll();
      setList(data);
    }catch(err){ console.error(err); alert('Lỗi tải người dùng'); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const openCreate = ()=>{ setEditingId(null); setForm({ name:'', email:'', role:'USER', password:'' }); setShowModal(true); };
  const openEdit = (u)=>{ setEditingId(u.id); setForm({ name:u.name, email:u.email, role:u.role || 'USER', password:'' }); setShowModal(true); };

  const submit = async (e)=>{
    e && e.preventDefault();
    if (!form.name || !form.email) return alert('Tên và email là bắt buộc');
    try{
      if(editingId){
        await userApi.update(editingId, form);
      } else {
        await userApi.create(form);
      }
      setForm({ name:'', email:'', role:'USER', password:'' });
      setEditingId(null);
      setShowModal(false);
      load();
    }catch(err){ console.error(err); alert('Lỗi lưu người dùng'); }
  };

  const remove = async (id)=>{ if(!confirm('Xác nhận xóa người dùng?')) return; try{ await userApi.delete(id); load(); }catch(err){ console.error(err); alert('Lỗi xóa'); } };

  const filtered = list.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Quản lý người dùng</h3>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={openCreate}>Tạo người dùng</button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div> <strong>Tổng:</strong> {list.length}</div>
        <input className="p-2 border rounded" placeholder="Tìm kiếm" value={query} onChange={(e)=>setQuery(e.target.value)} />
      </div>

      <div>
        {loading ? <div>Đang tải...</div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td className="py-2">
                    <button className="mr-2 text-blue-600" onClick={()=>setViewUser(u)}>Xem</button>
                    <button className="mr-2 text-blue-600" onClick={()=>openEdit(u)}>Sửa</button>
                    <button className="text-red-600" onClick={()=>remove(u.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={editingId ? 'Sửa người dùng' : 'Tạo người dùng'} open={showModal} onClose={()=>setShowModal(false)} footer={(
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>setShowModal(false)}>Hủy</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>{editingId ? 'Cập nhật' : 'Tạo'}</button>
        </div>
      )}>
        <form className="space-y-2" onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="p-2 border rounded" placeholder="Họ tên" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
            <input className="p-2 border rounded" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
            <select className="p-2 border rounded" value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <input className="p-2 border rounded" placeholder="Password (only for creation)" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} />
          </div>
        </form>
      </Modal>

      <Modal title={viewUser?.name || 'User'} open={!!viewUser} onClose={()=>setViewUser(null)} footer={viewUser && (
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>setViewUser(null)}>Đóng</button>
        </div>
      )}>
        {viewUser && (
          <div className="space-y-2">
            <div><strong>Họ tên:</strong> {viewUser.name}</div>
            <div><strong>Email:</strong> {viewUser.email}</div>
            <div><strong>Vai trò:</strong> {viewUser.role}</div>
            <div><strong>Avatar:</strong> {viewUser.avatarUrl ? <img src={viewUser.avatarUrl} alt="avatar" className="w-24 h-24 rounded" /> : 'Không có'}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}