import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flightApi } from '../api/flightApi';
import { flightSeatApi } from '../api/flightSeatApi';
import { ticketApi } from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Book() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const toast = useToast();

  const flightId = params.get('flightId');
  const flightSeatId = Number(params.get('flightSeatId')) || null;
  const passengers = Number(params.get('passengers')) || 1;

  const { user } = useAuth();

  const [flight, setFlight] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(flightSeatId);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [passengerData, setPassengerData] = useState(Array.from({ length: passengers }, () => ({ fullName: '' })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // booking steps: review -> passenger -> seats -> confirm
  const [step, setStep] = useState('review');
  const [showItinerary, setShowItinerary] = useState(false);

  useEffect(() => {
    let mounted = true;

    // If the navigation provided the flight object in location.state, use it to avoid refetch
    if (location.state?.flight) {
      const f = location.state.flight;
      setFlight(f);
      setSelectedClassId((prev) => prev || f.flightSeats?.[0]?.id);
      return () => (mounted = false);
    }

  }, [location.state]);

  useEffect(() => {
    let mounted = true;
    const loadSeats = async () => {
      if (!selectedClassId) return setAvailableSeats([]);
      try {
        const res = await flightSeatApi.getAvailableSeats(selectedClassId);
        if (!mounted) return;
        setAvailableSeats(res.seats);
      } catch (err) {
        setAvailableSeats([]);
      }
    };

    // reset selections when switching class
    setSelectedSeats([]);
    setLockedSeats([]);

    loadSeats();
    return () => (mounted = false);
  }, [selectedClassId]);

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= passengerData.length) return; // limit
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleLockSeats = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (selectedSeats.length !== passengerData.length) {
      toast.error('Vui lòng chọn đủ số ghế cho hành khách');
      return;
    }

    setLoading(true);
    try {
      const res = await flightSeatApi.lockSeats(selectedSeats);
      // locked seats returned
      toast.success(res.message);
      setLockedSeats(res.seats.map(s => s.id));
      // refresh available seats
      const refreshed = await flightSeatApi.getAvailableSeats(selectedClassId);
      setAvailableSeats(refreshed.seats);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Lỗi khi khoá ghế');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    // build bookingData per selected seat
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (selectedSeats.length !== passengerData.length) {
      toast.error('Vui lòng chọn đủ ghế');
      return;
    }

    const bookingData = selectedSeats.map((seatId, idx) => ({
      seatDetailId: seatId,
      flightId: flight.id,
      flightSeatId: selectedClassId,
      passengerData: passengerData[idx],
    }));

    setLoading(true);
    try {
      const res = await ticketApi.confirmBookings(bookingData);
      const tickets = res.data || res.tickets || [];

      if (tickets.length === 0) {
        throw new Error('Không tạo được vé');
      }

      toast.success(res.message || 'Booking successful');
      // unlock our locked seats reference so cleanup won't try to unlock again
      setLockedSeats([]);
      // send e-ticket email (fire-and-forget)
      const bookingRef = res.tickets?.[0]?.bookingReference || '';
      if (bookingRef) {
        ticketApi.sendETicket(bookingRef).catch((err) => {
          console.error('Failed to send e-ticket:', err);
        });
      }
      // navigate to booking success page showing booking ref
      navigate(`/booking-success?ref=${bookingRef}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Booking failed');
      // try to unlock seats we locked earlier to avoid leaving them locked
      try {
        if (lockedSeats.length > 0) {
          await flightSeatApi.unlockSeats(lockedSeats);
          setLockedSeats([]);
          const refreshed = await flightSeatApi.getAvailableSeats(selectedClassId);
          setAvailableSeats(refreshed.seats);
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  // cleanup: unlock locked seats when leaving page
  useEffect(() => {
    return () => {
      if (lockedSeats.length > 0) {
        flightSeatApi.unlockSeats(lockedSeats).catch(() => { });
      }
    };
  }, [lockedSeats]);

  if (!flightId) return <div className="p-6">Không có chuyến được chọn.</div>;

  const goBackToSelect = () => {
    const q = new URLSearchParams({ from: params.get('from') || '', to: params.get('to') || '', date: params.get('date') || '', passengers }).toString();
    navigate(`/select-flight?${q}`);
  };

  const selectedSeatClass = flight?.flightSeats?.find(fs => fs.id === selectedClassId);
  const pricePerSeat = selectedSeatClass ? selectedSeatClass.price : 0;
  const totalPrice = pricePerSeat * passengers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Đặt chỗ</h1>

        {loading && (
          <div className="mb-4 text-slate-600">Đang xử lý…</div>
        )}
        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
        )}

        {flight && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            {/* ===== STEP INDICATOR ===== */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {[
                { key: 'review', label: '1. Xác nhận' },
                { key: 'passenger', label: '2. Hành khách' },
                { key: 'seats', label: '3. Chỗ ngồi' },
                { key: 'confirm', label: '4. Hoàn tất' },
              ].map(s => (
                <div
                  key={s.key}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium
                  ${step === s.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* ===== REVIEW ===== */}
            {step === 'review' && (
              <div>
                <div className="mb-6">
                  <div className="text-lg font-semibold">
                    {flight.flightNumber} — {flight.aircraft?.name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {flight.departureAirport?.iataCode} → {flight.arrivalAirport?.iataCode} •{' '}
                    {new Date(flight.departureTime).toLocaleString()}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="border rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Hạng vé</p>
                    <p className="font-semibold">
                      {selectedSeatClass?.seatClass || '—'}
                    </p>
                  </div>

                  <div className="border rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Giá / khách</p>
                    <p className="font-semibold">
                      {pricePerSeat.toLocaleString()}₫
                    </p>
                  </div>

                  <div className="border rounded-xl p-4 bg-indigo-50 border-indigo-100">
                    <p className="text-xs text-slate-500 mb-1">Tổng tiền</p>
                    <p className="font-bold text-indigo-700 text-lg">
                      {totalPrice.toLocaleString()}₫
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => setShowItinerary(true)}
                    className="px-4 py-2 rounded-xl border hover:bg-slate-50"
                  >
                    Chi tiết hành trình
                  </button>

                  <button
                    onClick={goBackToSelect}
                    className="px-4 py-2 rounded-xl border hover:bg-slate-50"
                  >
                    Thay đổi chuyến bay
                  </button>

                  <button
                    onClick={() => {
                      if (user) return setStep('passenger');
                      navigate('/login', { state: { from: location } });
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Đăng nhập & tiếp tục
                  </button>
                </div>

                {showItinerary && (
                  <div className="mt-6 bg-slate-50 border rounded-xl p-5">
                    <h4 className="font-semibold mb-3">Thông tin hành trình</h4>
                    <div className="text-sm space-y-1 text-slate-700">
                      <div>Chuyến bay: {flight.flightNumber}</div>
                      <div>Máy bay: {flight.aircraft?.name}</div>
                      <div>
                        Khởi hành: {flight.departureAirport?.city} (
                        {flight.departureAirport?.iataCode}) —{' '}
                        {new Date(flight.departureTime).toLocaleString()}
                      </div>
                      <div>
                        Đến: {flight.arrivalAirport?.city} (
                        {flight.arrivalAirport?.iataCode}) —{' '}
                        {new Date(flight.arrivalTime).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Điều kiện vé: {selectedSeatClass?.fareRules || 'Xem chi tiết'}
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setShowItinerary(false)}
                        className="px-4 py-2 rounded-xl border"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== PASSENGER ===== */}
            {step === 'passenger' && (
              <div>
                <h3 className="font-semibold mb-4">Thông tin hành khách</h3>

                <div className="space-y-4">
                  {passengerData.map((p, idx) => (
                    <div key={idx} className="border rounded-xl p-4">
                      <label className="block text-sm text-slate-600 mb-2">
                        Hành khách {idx + 1}
                      </label>

                      <input
                        value={p.fullName}
                        onChange={(e) => {
                          const arr = [...passengerData];
                          arr[idx].fullName = e.target.value;
                          setPassengerData(arr);
                        }}
                        placeholder="Họ và tên"
                        className="w-full border rounded-lg px-3 py-2 mb-2"
                      />

                      <input
                        value={p.email || ''}
                        onChange={(e) => {
                          const arr = [...passengerData];
                          arr[idx].email = e.target.value;
                          setPassengerData(arr);
                        }}
                        placeholder="Email (tuỳ chọn)"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setStep('review')}
                    className="px-4 py-2 rounded-xl border"
                  >
                    Quay lại
                  </button>

                  <button
                    onClick={() => {
                      if (!user) {
                        navigate('/login', { state: { from: location } });
                        return;
                      }
                      setStep('seats');
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* ===== SEATS ===== */}
            {step === 'seats' && (
              <div>
                <h3 className="font-semibold mb-4">
                  Chọn chỗ ngồi ({selectedSeats.length}/{passengerData.length})
                </h3>

                <div className="grid grid-cols-6 gap-2 mb-6">
                  {availableSeats.map(s => (
                    <button
                      key={s.id}
                      onClick={() => toggleSeat(s.id)}
                      disabled={s.isBooked || s.isLocked}
                      className={`py-2 rounded-lg text-sm border
                      ${selectedSeats.includes(s.id)
                          ? 'bg-indigo-600 text-white'
                          : s.isBooked
                            ? 'bg-red-100 text-red-600 cursor-not-allowed'
                            : s.isLocked
                              ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                              : 'hover:bg-slate-50'
                        }`}
                    >
                      {s.seatNumber}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={handleLockSeats}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black"
                  >
                    Khoá ghế
                  </button>

                  <button
                    onClick={() => {
                      if (selectedSeats.length !== passengerData.length)
                        return toast.error('Vui lòng chọn đủ ghế');

                      const unlocked = selectedSeats.filter(
                        id => !lockedSeats.includes(id)
                      );
                      if (unlocked.length > 0)
                        return toast.error('Vui lòng khoá ghế trước');

                      setStep('confirm');
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* ===== CONFIRM ===== */}
            {step === 'confirm' && (
              <div>
                <h3 className="font-semibold mb-4">Xác nhận đặt chỗ</h3>

                <div className="mb-4 text-lg">
                  Tổng tiền:{' '}
                  <strong className="text-indigo-700">
                    {totalPrice.toLocaleString()}₫
                  </strong>
                </div>

                <div className="border rounded-xl p-4 mb-6">
                  <div className="font-medium mb-2">Hành khách & ghế</div>
                  <div className="text-sm space-y-1">
                    {selectedSeats.map((sId, idx) => {
                      const seat =
                        availableSeats.find(s => s.id === sId) || {};
                      return (
                        <div key={sId}>
                          {passengerData[idx]?.fullName || '—'} — Ghế:{' '}
                          {seat.seatNumber || '—'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setStep('seats')}
                    className="px-4 py-2 rounded-xl border"
                  >
                    Quay lại
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                  >
                    Xác nhận & gửi email
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

}
