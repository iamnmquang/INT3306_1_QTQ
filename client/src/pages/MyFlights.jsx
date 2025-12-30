import React, { useEffect, useState } from 'react';
import { ticketApi } from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MyFlights() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [otpState, setOtpState] = useState({ open: false, ticketNumber: null, code: '', loading: false });

  const reloadBookings = async () => {
    setLoading(true);
    try {
      const data = await ticketApi.getUserTickets();
      const groups = {};
      for (const t of data) {
        const ref = t.bookingReference;
        if (!groups[ref]) groups[ref] = [];
        groups[ref].push(t);
      }
      const arr = Object.keys(groups).map(ref => ({ bookingReference: ref, tickets: groups[ref] }));
      setBookings(arr);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Không thể tải lịch bay');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCancelCode = async (ticketNumber) => {
    if (!ticketNumber) return alert('Số vé không hợp lệ');
    try {
      setOtpState(s => ({ ...s, loading: true }));
      await ticketApi.sendCancelCode(ticketNumber);
      setOtpState({ open: true, ticketNumber, code: '', loading: false });
      alert('Mã hủy đã được gửi đến email của bạn');
    } catch (err) {
      setOtpState(s => ({ ...s, loading: false }));
      alert(err?.response?.data?.message || err.message || 'Không thể gửi mã hủy');
    }
  };

  const handleConfirmCancelWithCode = async () => {
    const { ticketNumber, code } = otpState;
    if (!ticketNumber || !code) return alert('Vui lòng nhập mã hủy');
    try {
      setOtpState(s => ({ ...s, loading: true }));
      await ticketApi.verifyCancelCode(ticketNumber, code);
      await ticketApi.cancelTicket(ticketNumber, code);
      setOtpState({ open: false, ticketNumber: null, code: '', loading: false });
      await reloadBookings();
      alert('Đã huỷ vé');
    } catch (err) {
      setOtpState(s => ({ ...s, loading: false }));
      alert(err?.response?.data?.message || err.message || 'Hủy thất bại');
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await ticketApi.getUserTickets();
        if (!mounted) return;
        // group by bookingReference
        const groups = {};
        for (const t of data) {
          const ref = t.bookingReference;
          if (!groups[ref]) groups[ref] = [];
          groups[ref].push(t);
        }
        const arr = Object.keys(groups).map(ref => ({ bookingReference: ref, tickets: groups[ref] }));
        setBookings(arr);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Không thể tải lịch bay');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [user]);



  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Lịch bay của tôi</h1>

      {loading && <div>Đang tải …</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && bookings.length === 0 && (
        <div className="p-4 bg-yellow-50 border rounded">Bạn chưa có chuyến bay nào.</div>
      )}

      <div className="space-y-4">
        {bookings.map(b => (
          <div key={b.bookingReference} className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Booking: {b.bookingReference}</div>
                <div className="text-sm text-gray-600">{b.tickets.length} vé</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {b.tickets.map(t => (
                <div key={t.id} className="border p-3 rounded">
                  <div className="font-medium">{t.flight.flightNumber} • {t.flight.aircraft?.name}</div>
                  <div className="text-sm text-gray-600">{t.flight.departureAirport?.iataCode} ({new Date(t.flight.departureTime).toLocaleString()}) → {t.flight.arrivalAirport?.iataCode} ({new Date(t.flight.arrivalTime).toLocaleString()})</div>
                  <div className="mt-2">Hành khách: {t.passenger?.fullName || '—'}</div>
                  <div>Ghế: {t.seatNumber}</div>
                  <div className="text-sm text-gray-500 mt-1">Trạng thái: {t.isCancelled ? 'Đã huỷ' : 'Xác nhận'}</div>

                  <div className="mt-3 flex gap-2">
                    {!t.isCancelled && t.ticketNumber && (
                      <button onClick={() => handleRequestCancelCode(t.ticketNumber)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Huỷ vé</button>
                    )}
                    {t.isCancelled && (
                      <span className="text-sm text-gray-500">Đã huỷ: {t.cancelCode || ''}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {otpState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="font-medium mb-2">Xác nhận hủy vé</h3>
            <p className="text-sm mb-3">Mã đã được gửi đến email của bạn; nhập mã để xác nhận hủy vé <strong>{otpState.ticketNumber}</strong></p>
            <input className="w-full border px-2 py-1 rounded" placeholder="Mã hủy" value={otpState.code} onChange={(e) => setOtpState(s => ({ ...s, code: e.target.value }))} />

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setOtpState({ open: false, ticketNumber: null, code: '', loading: false })} className="px-3 py-2 border rounded">Đóng</button>
              <button onClick={handleConfirmCancelWithCode} disabled={otpState.loading} className="px-3 py-2 bg-red-600 text-white rounded">Xác nhận huỷ</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
