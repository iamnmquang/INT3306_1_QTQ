import React, { useEffect, useState } from 'react';
import { aircraftApi } from '../../api/aircraftApi';
import Modal from '../common/Modal';

export default function AircraftManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: '', manufacturer: '', seats: [] });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await aircraftApi.getAll();
      setList(data);
    } catch (err) { console.error(err); alert('Lỗi tải danh sách máy bay'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm({ code: '', manufacturer: '', seats: [] }); setShowModal(true); };
  const openEdit = (a) => { setEditingId(a.id); setForm({ code: a.code || a.name || '', manufacturer: a.manufacturer || '', seats: a.seats || [] }); setShowModal(true); };

  const submit = async (e) => {
    e && e.preventDefault();
    if (!form.code || !form.manufacturer) return alert('Mã và hãng là bắt buộc');
    try {
      if (editingId) await aircraftApi.update(editingId, form);
      else await aircraftApi.create(form);
      setForm({ code: '', manufacturer: '', seats: [] });
      setEditingId(null);
      setShowModal(false);
      load();
    } catch (err) { console.error(err); alert('Lỗi lưu máy bay'); }
  };

  const addSeatRow = () => setForm(prev => ({ ...prev, seats: [...(prev.seats || []), { seatNumber: '', class: 'ECONOMY' }] }));
  const updateSeat = (idx, key, value) => setForm(prev => ({ ...prev, seats: prev.seats.map((s, i) => i === idx ? ({ ...s, [key]: value }) : s) }));
  const removeSeat = (idx) => setForm(prev => ({ ...prev, seats: prev.seats.filter((_, i) => i !== idx) }));

  const remove = async (id) => { if (!confirm('Xác nhận xóa?')) return; try { await aircraftApi.delete(id); load(); } catch (err) { console.error(err); alert('Lỗi xóa'); } };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
              Quản lý tàu bay
            </h1>
            <p className="text-slate-600">
              Tổng cộng {list.length} tàu bay
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg text-white font-medium
                     bg-gradient-to-r from-blue-600 to-indigo-600
                     hover:opacity-90 transition"
          >
            + Thêm tàu bay
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : list.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              Chưa có tàu bay nào
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">Mã / Tên</th>
                  <th className="px-4 py-3 text-sm font-semibold">Hãng sản xuất</th>
                  <th className="px-4 py-3 text-sm font-semibold">Số ghế</th>
                  <th className="px-4 py-3 text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map(a => (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      {a.code || a.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {a.manufacturer}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {(a.seats || []).length} ghế
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-sm">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => openEdit(a)}
                        >
                          Sửa
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => remove(a.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Create / Edit */}
        <Modal
          title={editingId ? 'Sửa tàu bay' : 'Tạo tàu bay'}
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
                className="px-4 py-2 text-white rounded
                         bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={submit}
              >
                {editingId ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          )}
        >
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="p-2 border rounded"
                placeholder="Mã / Tên tàu bay"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
              <input
                className="p-2 border rounded"
                placeholder="Hãng sản xuất"
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Danh sách ghế</div>
                <button
                  type="button"
                  className="text-sm px-3 py-1 rounded bg-slate-100 hover:bg-slate-200"
                  onClick={addSeatRow}
                >
                  + Thêm ghế
                </button>
              </div>

              <div className="space-y-2">
                {(form.seats || []).map((s, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      className="p-2 border rounded flex-1"
                      placeholder="Seat number"
                      value={s.seatNumber}
                      onChange={(e) =>
                        updateSeat(idx, 'seatNumber', e.target.value)
                      }
                    />
                    <select
                      className="p-2 border rounded"
                      value={s.class}
                      onChange={(e) =>
                        updateSeat(idx, 'class', e.target.value)
                      }
                    >
                      <option value="ECONOMY">Economy</option>
                      <option value="BUSINESS">Business</option>
                      <option value="FIRST_CLASS">First</option>
                    </select>
                    <button
                      type="button"
                      className="text-red-600 text-sm"
                      onClick={() => removeSeat(idx)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}

                {(form.seats || []).length === 0 && (
                  <div className="text-sm text-slate-400">
                    Chưa có ghế nào
                  </div>
                )}
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );

}