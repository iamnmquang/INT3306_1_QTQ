import React, { useState } from 'react';
import { ticketApi } from '../api/ticketApi';
import Modal from '../components/common/Modal';

export default function BookingSearch(){
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [view, setView] = useState(null);

  const search = async (e) => {
    e && e.preventDefault();
    if (!ref) return setError('Nhập booking reference');
    setLoading(true);
    setError(null);
    try{
      const data = await ticketApi.getByBookingReference(ref.trim());
      setResults(data);
      if(!data || data.length === 0) setError('Không tìm thấy booking');
    }catch(err){
      console.error(err);
      setError(err?.response?.data?.message || 'Lỗi khi tìm kiếm');
      setResults([]);
    }finally{ setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Tra cứu đặt vé theo Booking Reference</h2>
        <div className="text-sm text-gray-500 mb-4">Bạn không cần đăng nhập — chỉ cần nhập Booking Reference để tra cứu thông tin vé.</div>
        <form onSubmit={search} className="flex gap-2 items-center">
          <input value={ref} onChange={(e)=>setRef(e.target.value)} placeholder="Nhập booking reference" className="flex-1 p-2 border rounded" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Đang...' : 'Tra cứu'}</button>
        </form>

        {error && <div className="text-red-600 mt-3">{error}</div>}

        <div className="mt-6">
          {results.length > 0 && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b"><th>BookingRef</th><th>Ticket#</th><th>Flight</th><th>Passenger</th><th>Action</th></tr>
              </thead>
              <tbody>
                {results.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{t.bookingReference}</td>
                    <td>{t.ticketNumber}</td>
                    <td>{t.flight?.flightNumber}</td>
                    <td>{t.passenger?.fullName || t.passengerName || '—'}</td>
                    <td><button className="text-blue-600" onClick={()=>setView(t)}>Xem</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal title={view ? `Booking ${view.bookingReference}` : 'Booking'} open={!!view} onClose={()=>setView(null)} footer={view && (
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={()=>setView(null)}>Đóng</button>
        </div>
      )}>
        {view && (
          <div className="space-y-2">
            <div><strong>Ticket#:</strong> {view.ticketNumber}</div>
            <div><strong>Flight:</strong> {view.flight?.flightNumber}</div>
            <div><strong>Seat:</strong> {view.seatNumber || view.seatDetail?.seatNumber || '—'}</div>
            <div><strong>Passenger:</strong> {view.passenger?.fullName || view.passengerName || '—'}</div>
            <div><strong>Booked at:</strong> {new Date(view.bookedAt).toLocaleString()}</div>
            <div><strong>Cancelled:</strong> {view.isCancelled ? 'Yes' : 'No'}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}