import React, { useEffect, useState } from 'react';
import { flightApi } from '../../api/flightApi';
import { aircraftApi } from '../../api/aircraftApi';
import { airportApi } from '../../api/airportApi';
import Modal from '../common/Modal';

export default function FlightManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aircrafts, setAircrafts] = useState([]);
  const [airports, setAirports] = useState([]);
  const [form, setForm] = useState({ flightNumber: '', aircraftId: null, departureAirportId: null, arrivalAirportId: null, departureTime: '', arrivalTime: '', status: 'SCHEDULED' });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setAircrafts(await aircraftApi.getAll());
      setAirports(await airportApi.getAll());
      const data = await flightApi.getAll();
      setList(data);
    } catch (err) { console.error(err); alert('Lỗi tải chuyến bay'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm({ flightNumber: '', aircraftId: null, departureAirportId: null, arrivalAirportId: null, departureTime: '', arrivalTime: '', status: 'SCHEDULED' }); setShowModal(true); };
  const openEdit = (f) => { setEditingId(f.id); setForm({ flightNumber: f.flightNumber, aircraftId: f.aircraftId, departureAirportId: f.departureAirportId, arrivalAirportId: f.arrivalAirportId, departureTime: f.departureTime, arrivalTime: f.arrivalTime, status: f.status }); setShowModal(true); };

  const submit = async (e) => {
    e && e.preventDefault();
    if (!form.flightNumber) return alert('Số hiệu chuyến là bắt buộc');
    try {
      if (editingId) await flightApi.update(editingId, form);
      else await flightApi.create(form);
      setForm({ flightNumber: '', aircraftId: null, departureAirportId: null, arrivalAirportId: null, departureTime: '', arrivalTime: '', status: 'SCHEDULED' });
      setEditingId(null);
      setShowModal(false);
      load();
    } catch (err) { console.error(err); alert('Lỗi lưu chuyến bay'); }
  };

  const remove = async (id) => { if (!confirm('Xác nhận xóa?')) return; try { await flightApi.delete(id); load(); } catch (err) { console.error(err); alert('Lỗi xóa'); } };

  const delayFlight = async (f) => {
    const newTime = prompt('Nhập giờ khởi hành mới (ISO hoặc "YYYY-MM-DDTHH:mm")', f.departureTime);
    if (!newTime) return;
    try {
      await flightApi.update(f.id, { ...f, departureTime: newTime });
      load();
    } catch (err) { console.error(err); alert('Lỗi cập nhật thời gian'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
              Quản lý chuyến bay
            </h1>
            <p className="text-slate-600">
              Tổng cộng {list.length} chuyến bay
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-lg text-white font-medium
                     bg-gradient-to-r from-blue-600 to-indigo-600
                     hover:opacity-90 transition"
          >
            + Thêm chuyến bay
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : list.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Chưa có chuyến bay nào
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">Số hiệu</th>
                  <th className="px-4 py-3 text-sm font-semibold">Máy bay</th>
                  <th className="px-4 py-3 text-sm font-semibold">Hành trình</th>
                  <th className="px-4 py-3 text-sm font-semibold">Khởi hành</th>
                  <th className="px-4 py-3 text-sm font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map(f => (
                  <tr
                    key={f.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      {f.flightNumber}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {f.aircraft?.code || f.aircraft?.name || f.aircraftId}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {f.departureAirport?.iataCode || '-'}
                      <span className="mx-1">→</span>
                      {f.arrivalAirport?.iataCode || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(f.departureTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${f.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-700'
                            : f.status === 'DELAYED'
                              ? 'bg-yellow-100 text-yellow-700'
                              : f.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-sm">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => openEdit(f)}
                        >
                          Sửa
                        </button>
                        <button
                          className="text-orange-600 hover:text-orange-800"
                          onClick={() => delayFlight(f)}
                        >
                          Delay
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => remove(f.id)}
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
          title={editingId ? 'Sửa chuyến bay' : 'Tạo chuyến bay'}
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
                placeholder="Số hiệu chuyến"
                value={form.flightNumber}
                onChange={(e) =>
                  setForm({ ...form, flightNumber: e.target.value })
                }
                required
              />

              <select
                className="p-2 border rounded"
                value={form.aircraftId || ''}
                onChange={(e) =>
                  setForm({ ...form, aircraftId: e.target.value || null })
                }
              >
                <option value="">-- Chọn tàu bay --</option>
                {aircrafts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.code || a.name} - {a.manufacturer}
                  </option>
                ))}
              </select>

              <select
                className="p-2 border rounded"
                value={form.departureAirportId || ''}
                onChange={(e) =>
                  setForm({ ...form, departureAirportId: e.target.value || null })
                }
              >
                <option value="">-- Sân bay đi --</option>
                {airports.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.iataCode} - {a.city || a.name}
                  </option>
                ))}
              </select>

              <select
                className="p-2 border rounded"
                value={form.arrivalAirportId || ''}
                onChange={(e) =>
                  setForm({ ...form, arrivalAirportId: e.target.value || null })
                }
              >
                <option value="">-- Sân bay đến --</option>
                {airports.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.iataCode} - {a.city || a.name}
                  </option>
                ))}
              </select>

              <input
                className="p-2 border rounded"
                type="datetime-local"
                value={form.departureTime?.slice(0, 16) || ''}
                onChange={(e) =>
                  setForm({ ...form, departureTime: e.target.value })
                }
              />

              <input
                className="p-2 border rounded"
                type="datetime-local"
                value={form.arrivalTime?.slice(0, 16) || ''}
                onChange={(e) =>
                  setForm({ ...form, arrivalTime: e.target.value })
                }
              />

              <select
                className="p-2 border rounded"
                value={form.status || 'SCHEDULED'}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="DELAYED">DELAYED</option>
                <option value="DEPARTED">DEPARTED</option>
                <option value="ARRIVED">ARRIVED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );

}