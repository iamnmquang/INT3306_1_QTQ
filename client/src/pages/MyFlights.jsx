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
  const [activeTab, setActiveTab] = useState('UPCOMING'); // UPCOMING | CANCELLED


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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8">
          Lịch bay của tôi
        </h1>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-12 text-slate-600">
            Đang tải dữ liệu...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              ✈️
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Bạn chưa có chuyến bay nào
            </h3>
            <p className="text-slate-600 mb-6">
              Hãy đặt vé để bắt đầu hành trình của bạn
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"
            >
              Tìm chuyến bay
            </button>
          </div>
        )}

        {/* TABS */}
        {!loading && bookings.length > 0 && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-1 mb-6 inline-flex">
              <button
                onClick={() => setActiveTab('UPCOMING')}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition
                ${activeTab === 'UPCOMING'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Sắp tới
              </button>
              <button
                onClick={() => setActiveTab('CANCELLED')}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition
                ${activeTab === 'CANCELLED'
                    ? 'bg-red-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                Đã huỷ
              </button>
            </div>

            {/* UPCOMING */}
            {activeTab === 'UPCOMING' && (
              <div className="space-y-6">
                {bookings.map((b) => {
                  const activeTickets = b.tickets.filter(t => !t.isCancelled);
                  if (activeTickets.length === 0) return null;

                  return (
                    <div
                      key={b.bookingReference}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/80 text-sm">Mã đặt chỗ</p>
                            <p className="text-white font-bold text-lg">
                              {b.bookingReference}
                            </p>
                          </div>
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                            {activeTickets.length} vé
                          </span>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTickets.map((t) => (
                          <div
                            key={t.id}
                            className="border border-slate-200 rounded-xl p-4"
                          >
                            <div className="flex justify-between mb-2">
                              <div className="font-semibold">
                                ✈️ {t.flight.flightNumber}
                              </div>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                Xác nhận
                              </span>
                            </div>

                            <div className="text-sm text-slate-600">
                              {t.flight.departureAirport?.iataCode} →{' '}
                              {t.flight.arrivalAirport?.iataCode}
                            </div>

                            <div className="mt-2 text-sm">
                              👤 {t.passenger?.fullName || '—'} <br />
                              💺 Ghế: {t.seatNumber}
                            </div>

                            <div className="mt-4">
                              <button
                                onClick={() =>
                                  handleRequestCancelCode(t.ticketNumber)
                                }
                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm"
                              >
                                Huỷ vé
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CANCELLED */}
            {activeTab === 'CANCELLED' && (
              <div className="space-y-6">
                {bookings.map((b) => {
                  const cancelledTickets = b.tickets.filter(t => t.isCancelled);
                  if (cancelledTickets.length === 0) return null;

                  return (
                    <div
                      key={b.bookingReference + '-cancelled'}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                    >
                      <div className="bg-slate-100 px-6 py-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Mã đặt chỗ</p>
                            <p className="font-semibold text-slate-900">
                              {b.bookingReference}
                            </p>
                          </div>
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                            {cancelledTickets.length} vé đã huỷ
                          </span>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cancelledTickets.map((t) => (
                          <div
                            key={t.id}
                            className="border border-dashed border-slate-300 rounded-xl p-4 text-slate-500"
                          >
                            <div className="font-medium">
                              ✈️ {t.flight.flightNumber}
                            </div>
                            <div className="text-sm">
                              {t.flight.departureAirport?.iataCode} →{' '}
                              {t.flight.arrivalAirport?.iataCode}
                            </div>
                            <div className="text-xs mt-2">
                              Mã huỷ: {t.cancelCode || '--'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* OTP MODAL */}
        {otpState.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="font-semibold text-lg mb-2">Xác nhận huỷ vé</h3>
              <p className="text-sm text-slate-600 mb-4">
                Nhập mã huỷ cho vé <strong>{otpState.ticketNumber}</strong>
              </p>

              <input
                className="w-full border rounded-xl px-3 py-2 mb-4"
                placeholder="Mã huỷ"
                value={otpState.code}
                onChange={(e) =>
                  setOtpState(s => ({ ...s, code: e.target.value }))
                }
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() =>
                    setOtpState({
                      open: false,
                      ticketNumber: null,
                      code: '',
                      loading: false
                    })
                  }
                  className="px-4 py-2 border rounded-xl"
                >
                  Đóng
                </button>
                <button
                  onClick={handleConfirmCancelWithCode}
                  disabled={otpState.loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl"
                >
                  Xác nhận huỷ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );



}
