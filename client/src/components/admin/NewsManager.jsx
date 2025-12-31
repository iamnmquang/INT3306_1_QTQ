import React, { useEffect, useState } from 'react';
import { newsApi } from '../../api/newsApi';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';


/** =========================
 *  ẢNH CỐ ĐỊNH CHO TIN TỨC
 *  👉 sau này chỉ đổi path tại đây
 *  ========================= */
const FIXED_NEWS_IMAGE = '/public/images/QTQAirlinelogo.jpg';

export default function NewsManager() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [form, setForm] = useState({
    title: '',
    content: '',
    thumbnailUrl: '',
    isPublished: false
  });
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
      toast.error('Lỗi khi tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', content: '', thumbnailUrl: '', isPublished: false });
    setShowModal(true);
  };

  const openEdit = (n) => {
    setEditingId(n.id);
    setForm({
      title: n.title || '',
      content: n.content || '',
      thumbnailUrl: '',
      isPublished: !!n.isPublished
    });
    setShowModal(true);
  };

  const submit = async (e) => {
    e && e.preventDefault();
    if (!form.title || !form.content) {
      return toast.error('Title và content là bắt buộc');
    }

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
      toast.error('Lỗi khi lưu tin tức');
    }
  };

  const remove = async (id) => {
    if (!confirm('Xác nhận xóa?')) return;
    try {
      await newsApi.delete(id);
      load();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
              Quản lý tin tức / thông báo
            </h1>
            <p className="text-slate-600">
              Tổng cộng {news.length} bài viết
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg text-white font-medium
                       bg-gradient-to-r from-blue-600 to-indigo-600
                       hover:opacity-90 transition"
          >
            + Thêm tin mới
          </button>
        </div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">Chưa có tin tức nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-xl border border-slate-200
                           overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* ===== IMAGE (CỐ ĐỊNH) ===== */}
                <div className="relative aspect-video bg-slate-100">
                  <img
                    src={FIXED_NEWS_IMAGE}
                    alt={n.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full text-white
                      ${n.isPublished ? 'bg-green-600' : 'bg-slate-500'}`}
                    >
                      {n.isPublished ? 'Công khai' : 'Ẩn'}
                    </span>
                  </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">
                    {n.title}
                  </h3>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {n.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-slate-500">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-3 text-sm">
                      <button
                        className="text-slate-600 hover:text-slate-900"
                        onClick={() => setViewItem(n)}
                      >
                        Xem
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openEdit(n)}
                      >
                        Sửa
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => remove(n.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== MODAL CREATE / EDIT ===== */}
        <Modal
          title={editingId ? 'Sửa tin' : 'Tạo tin'}
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
          <form onSubmit={submit} className="space-y-3">
            <input
              className="w-full p-2 border rounded"
              placeholder="Tiêu đề"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              rows={8}
              className="w-full p-2 border rounded"
              placeholder="Nội dung"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
              />
              Công khai
            </label>
          </form>
        </Modal>

        {/* ===== MODAL VIEW ===== */}
        <Modal
          title={viewItem?.title || 'Xem tin'}
          open={!!viewItem}
          onClose={() => setViewItem(null)}
        >
          {viewItem && (
            <div>
              <img
                src={FIXED_NEWS_IMAGE}
                alt="thumb"
                className="w-full h-52 object-cover rounded mb-3"
              />
              <div className="text-sm text-gray-500 mb-3">
                {new Date(viewItem.createdAt).toLocaleString()}
              </div>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: viewItem.content }}
              />
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}
