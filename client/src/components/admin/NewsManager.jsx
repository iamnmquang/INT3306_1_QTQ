import React, { useEffect, useState } from 'react';
import { newsApi } from '../../api/newsApi';
import Modal from '../common/Modal';

export default function NewsManager() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', thumbnailUrl: '', isPublished: false });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await newsApi.getAll();
      setNews(data);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm({ title: '', content: '', thumbnailUrl: '', isPublished: false }); setShowModal(true); };
  const openEdit = (n) => { setEditingId(n.id); setForm({ title: n.title || '', content: n.content || '', thumbnailUrl: n.thumbnailUrl || '', isPublished: !!n.isPublished }); setShowModal(true); };

  const submit = async (e) => {
    e && e.preventDefault();
    if (!form.title || !form.content) return alert('Title và content là bắt buộc');
    try {
      if (editingId) {
        await newsApi.update(editingId, form);
      } else {
        await newsApi.create(form);
      }
      setShowModal(false);
      load();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu tin tức');
    }
  };

  const remove = async (id) => {
    if (!confirm('Xác nhận xóa?')) return;
    try {
      await newsApi.delete(id);
      load();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa');
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Quản lý tin tức / thông báo</h3>
        <div>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={openCreate}>Tạo tin mới</button>
        </div>
      </div>

      <div>
        {loading ? <div>Đang tải...</div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b"><th>Tiêu đề</th><th>Published</th><th>Ngày</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {news.map(n => (
                <tr key={n.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{n.title}</td>
                  <td>{n.isPublished ? '✔' : ''}</td>
                  <td className="text-sm text-gray-500">{new Date(n.createdAt).toLocaleString()}</td>
                  <td className="py-2">
                    <button className="mr-2 text-blue-600" onClick={()=>setViewItem(n)}>Xem</button>
                    <button className="mr-2 text-blue-600" onClick={()=>openEdit(n)}>Sửa</button>
                    <button className="text-red-600" onClick={()=>remove(n.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={editingId ? 'Sửa tin' : 'Tạo tin'} open={showModal} onClose={()=>setShowModal(false)} footer={(
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>setShowModal(false)}>Hủy</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>{editingId ? 'Cập nhật' : 'Tạo'}</button>
        </div>
      )}>
        <form onSubmit={submit} className="space-y-2">
          <input className="w-full p-2 border rounded" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} required />
          <textarea rows={8} className="w-full p-2 border rounded" placeholder="Content" value={form.content} onChange={(e)=>setForm({...form, content:e.target.value})} required />
          <input className="w-full p-2 border rounded" placeholder="Thumbnail URL" value={form.thumbnailUrl} onChange={(e)=>setForm({...form, thumbnailUrl:e.target.value})} />
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isPublished} onChange={(e)=>setForm({...form, isPublished:e.target.checked})} /> Công khai</label>
        </form>
      </Modal>

      <Modal title={viewItem?.title || 'Xem tin'} open={!!viewItem} onClose={()=>setViewItem(null)}>
        {viewItem && (
          <div>
            {viewItem.thumbnailUrl && <img src={viewItem.thumbnailUrl} alt="thumb" className="w-full h-52 object-cover rounded mb-3" />}
            <h4 className="text-lg font-semibold mb-2">{viewItem.title}</h4>
            <div className="text-sm text-gray-500 mb-3">{new Date(viewItem.createdAt).toLocaleString()}</div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: viewItem.content }} />
          </div>
        )}
      </Modal>
    </div>
  );
}