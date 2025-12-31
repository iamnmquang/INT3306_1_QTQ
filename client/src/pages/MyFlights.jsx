import React, { useEffect, useState } from 'react';
import { ticketApi } from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function MyFlights() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('UPCOMING'); // UPCOMING | CANCELLED
  const toast = useToast();


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
    if (!ticketNumber) return toast.error('Số vé không hợp lệ');
    try {
      setOtpState(s => ({ ...s, loading: true }));
      await ticketApi.sendCancelCode(ticketNumber);
      setOtpState({ open: true, ticketNumber, code: '', loading: false });
      toast.success('Mã hủy đã được gửi đến email của bạn');
    } catch (err) {
      setOtpState(s => ({ ...s, loading: false }));
      toast.error(err?.response?.data?.message || err.message || 'Không thể gửi mã hủy');
    }
  };

  const handleConfirmCancelWithCode = async () => {
    const { ticketNumber, code } = otpState;
    if (!ticketNumber || !code) return toast.error('Vui lòng nhập mã hủy');
    try {
      setOtpState(s => ({ ...s, loading: true }));
      await ticketApi.verifyCancelCode(ticketNumber, code);
      await ticketApi.cancelTicket(ticketNumber, code);
      setOtpState({ open: false, ticketNumber: null, code: '', loading: false });
      await reloadBookings();
      toast.success('Đã huỷ vé');
    } catch (err) {
      setOtpState(s => ({ ...s, loading: false }));
      toast.error(err?.response?.data?.message || err.message || 'Hủy thất bại');
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Lịch bay của tôi
          </h1>
          <p className="text-slate-600 mt-1">
            Quản lý các chuyến bay bạn đã đặt
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            Đang tải dữ liệu...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-6">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-semibold">Có lỗi xảy ra</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ✈️
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Bạn chưa có chuyến bay nào
            </h3>
            <p className="text-slate-600 mb-6">
              Đặt vé ngay để bắt đầu hành trình của bạn
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600
                       text-white rounded-xl font-medium hover:opacity-90"
            >
              Tìm chuyến bay
            </button>
          </div>
        )}

        {/* CONTENT */}
        {!loading && bookings.length > 0 && (
          <>
            {/* TABS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-1 mb-8 inline-flex shadow-sm">
              {[
                { key: 'UPCOMING', label: 'Sắp tới', color: 'blue' },
                { key: 'CANCELLED', label: 'Đã huỷ', color: 'red' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition
                  ${activeTab === tab.key
                      ? `bg-${tab.color}-600 text-white shadow`
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* UPCOMING */}
            {activeTab === 'UPCOMING' && (
              <div className="space-y-8">
                {bookings.map(b => {
                  const activeTickets = b.tickets.filter(t => !t.isCancelled);
                  if (activeTickets.length === 0) return null;

                  return (
                    <div
                      key={b.bookingReference}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      {/* BOOKING HEADER */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white/80 text-sm">
                              Mã đặt chỗ
                            </div>
                            <div className="text-white font-bold text-lg">
                              {b.bookingReference}
                            </div>
                          </div>
                          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                            {activeTickets.length} vé
                          </span>
                        </div>
                      </div>

                      {/* TICKETS */}
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {activeTickets.map(t => (
                          <div
                            key={t.id}
                            className="border border-slate-200 rounded-xl p-4 hover:shadow transition"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-semibold">
                                ✈️ {t.flight.flightNumber}
                              </div>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                Đã xác nhận
                              </span>
                            </div>

                            <div className="text-sm text-slate-600 space-y-1">
                              <div>
                                {t.flight?.departureAirport?.iataCode || '—'} → {t.flight?.arrivalAirport?.iataCode || '—'}
                              </div>
                              <div className="text-xs text-slate-400">
                                {t.flight?.departureTime &&
                                  new Date(t.flight.departureTime).toLocaleString()}
                              </div>
                            </div>

                            <div className="mt-3 text-sm">
                              👤 {t.passenger?.fullName || t.passengerName || '—'}<br />
                              💺 Ghế: {t.seatNumber || t.seatDetail?.seatNumber || '—'}
                            </div>

                            <button
                              onClick={() => handleRequestCancelCode(t.ticketNumber)}
                              className="mt-4 px-3 py-1.5 bg-red-500 hover:bg-red-600
                                       text-white rounded-lg text-sm"
                            >
                              Huỷ vé
                            </button>
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
              <div className="space-y-8">
                {bookings.map(b => {
                  const cancelled = b.tickets.filter(t => t.isCancelled);
                  if (cancelled.length === 0) return null;

                  return (
                    <div
                      key={b.bookingReference + '-cancel'}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      <div className="bg-slate-100 px-6 py-4 flex justify-between">
                        <div>
                          <div className="text-sm text-slate-500">Mã đặt chỗ</div>
                          <div className="font-semibold">{b.bookingReference}</div>
                        </div>
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                          {cancelled.length} vé đã huỷ
                        </span>
                      </div>

                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cancelled.map(t => (
                          <div
                            key={t.id}
                            className="border border-dashed border-slate-300 rounded-xl p-4 text-slate-500"
                          >
                            <div className="font-medium mb-1">
                              ✈️ {t.flight.flightNumber}
                            </div>
                            <div className="text-sm">
                              {t.flight?.departureAirport?.iataCode || '—'} → {t.flight?.arrivalAirport?.iataCode || '—'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="font-semibold text-lg mb-1">
                Xác nhận huỷ vé
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Nhập mã huỷ cho vé <strong>{otpState.ticketNumber}</strong>
              </p>

              <input
                className="w-full border rounded-xl px-3 py-2 mb-5 focus:ring-2 focus:ring-red-500"
                placeholder="Mã huỷ"
                value={otpState.code}
                onChange={e =>
                  setOtpState(s => ({ ...s, code: e.target.value }))
                }
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() =>
                    setOtpState({ open: false, ticketNumber: null, code: '', loading: false })
                  }
                  className="px-4 py-2 border rounded-xl"
                >
                  Đóng
                </button>
                <button
                  onClick={handleConfirmCancelWithCode}
                  disabled={otpState.loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700
                           text-white rounded-xl disabled:opacity-50"
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
