import React, { useEffect, useState } from 'react';
import { ticketApi } from '../../api/ticketApi';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';

export default function BookingManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const toast = useToast();
  const [cancelItem, setCancelItem] = useState(null);
  const [confirmId, setConfirmId] = useState(null);





  const load = async () => {
    setLoading(true);
    try {
      const data = await ticketApi.getAll();
      setList(data);
    } catch (err) { console.error(err); toast.error('Lỗi tải booking'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cancelTicket = (t) => {
    setCancelItem(t);
  };

  const confirmCancelTicket = async () => {
    try {
      await ticketApi.update(cancelItem.id, { isCancelled: true });
      toast.success('Hủy vé thành công');
      load();
      setViewItem(null);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi hủy vé');
    } finally {
      setCancelItem(null);
    }
  };


  const sendETicket = async (t) => {
    try {
      await ticketApi.sendETicket(t.bookingReference);
      toast.success('E-ticket đã được gửi');
    } catch (err) { console.error(err); toast.error('Lỗi gửi e-ticket'); }
  };

  const remove = (id) => {
    setConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await ticketApi.delete(confirmId);
      toast.success('Đã xóa thành công');
      load();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa');
    } finally {
      setConfirmId(null);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            Quản lý đặt vé
          </h1>
          <p className="text-slate-600">
            Tổng cộng {list.length} vé
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : list.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              Chưa có vé nào
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold">Booking Ref</th>
                  <th className="px-4 py-3 text-sm font-semibold">Ticket #</th>
                  <th className="px-4 py-3 text-sm font-semibold">Chuyến bay</th>
                  <th className="px-4 py-3 text-sm font-semibold">Ghế</th>
                  <th className="px-4 py-3 text-sm font-semibold">Hành khách</th>
                  <th className="px-4 py-3 text-sm font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map(t => (
                  <tr
                    key={t.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      {t.bookingReference}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {t.ticketNumber}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {t.flight?.flightNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {t.seatNumber ||
                        t.seatDetail?.seatNumber ||
                        (t.flightSeat ? t.flightSeat.seatClass : '—')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {t.passenger?.fullName ||
                        t.passengerName ||
                        t.bookedBy?.name ||
                        '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${t.isCancelled
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {t.isCancelled ? 'Đã hủy' : 'Đang hiệu lực'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-sm">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => setViewItem(t)}
                        >
                          Xem
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-800"
                          onClick={() => sendETicket(t)}
                        >
                          Gửi E-ticket
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => remove(t.id)}
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

        {/* Modal chi tiết */}
        <Modal
          title={viewItem ? `Booking ${viewItem.bookingReference}` : 'Booking'}
          open={!!viewItem}
          onClose={() => setViewItem(null)}
          footer={
            viewItem && (
              <div className="flex justify-end gap-2">
                {!viewItem.isCancelled && (
                  <button
                    className="px-4 py-2 rounded text-white
                             bg-gradient-to-r from-orange-500 to-red-500"
                    onClick={() => cancelTicket(viewItem)}
                  >
                    Hủy vé
                  </button>
                )}
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setViewItem(null)}
                >
                  Đóng
                </button>
              </div>
            )
          }
        >
          {viewItem && (
            <div className="space-y-2 text-sm">
              <div><strong>Ticket #:</strong> {viewItem.ticketNumber}</div>
              <div><strong>Booking Ref:</strong> {viewItem.bookingReference}</div>
              <div><strong>Chuyến bay:</strong> {viewItem.flight?.flightNumber}</div>
              <div>
                <strong>Ghế:</strong>{' '}
                {viewItem.seatNumber ||
                  viewItem.seatDetail?.seatNumber ||
                  (viewItem.flightSeat ? viewItem.flightSeat.seatClass : '—')}
              </div>
              <div>
                <strong>Hành khách:</strong>{' '}
                {viewItem.passenger?.fullName ||
                  viewItem.passengerName ||
                  viewItem.bookedBy?.name ||
                  '—'}
              </div>
              <div>
                <strong>Thời gian đặt:</strong>{' '}
                {new Date(viewItem.bookedAt).toLocaleString()}
              </div>
              <div>
                <strong>Trạng thái:</strong>{' '}
                {viewItem.isCancelled ? 'Đã hủy' : 'Đang hiệu lực'}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          open={!!confirmId}
          onClose={() => setConfirmId(null)}
          title="Xác nhận xóa"
        >
          <div className="space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl">
                ⚠️
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <p className="text-slate-800 font-medium mb-1">
                Bạn có chắc chắn muốn xóa vé này?
              </p>
              <p className="text-sm text-slate-500">
                Hành động này không thể hoàn tác sau khi thực hiện.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300
                   text-slate-700 hover:bg-slate-100 transition"
              >
                Hủy
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg
                   bg-red-600 text-white font-medium
                   hover:bg-red-700 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          open={!!cancelItem}
          onClose={() => setCancelItem(null)}
          title="Xác nhận hủy vé"
        >
          <div className="space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl">
                ✈️
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <p className="text-slate-800 font-medium mb-1">
                Bạn có chắc chắn muốn hủy vé này?
              </p>
              <p className="text-sm text-slate-500">
                Vé đã hủy sẽ không thể khôi phục lại.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setCancelItem(null)}
                className="px-4 py-2 rounded-lg border border-slate-300
                   text-slate-700 hover:bg-slate-100 transition"
              >
                Đóng
              </button>

              <button
                onClick={confirmCancelTicket}
                className="px-4 py-2 rounded-lg
                   bg-red-600 text-white font-medium
                   hover:bg-red-700 transition"
              >
                Hủy vé
              </button>
            </div>
          </div>
        </Modal>


      </div>
    </div>
  );

}