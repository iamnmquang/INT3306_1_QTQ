import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flightApi } from '../api/flightApi';
import { flightSeatApi } from '../api/flightSeatApi';
import { ticketApi } from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';

export default function Book() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

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
      alert('Vui lòng chọn đủ số ghế cho hành khách');
      return;
    }

    setLoading(true);
    try {
      const res = await flightSeatApi.lockSeats(selectedSeats);
      // locked seats returned
      alert(res.message);
      setLockedSeats(res.seats.map(s => s.id));
      // refresh available seats
      const refreshed = await flightSeatApi.getAvailableSeats(selectedClassId);
      setAvailableSeats(refreshed.seats);
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Lỗi khi khoá ghế');
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
      alert('Vui lòng chọn đủ ghế');
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
      alert(res.message || 'Booking successful');
      // unlock our locked seats reference so cleanup won't try to unlock again
      setLockedSeats([]);
      // send e-ticket email (fire-and-forget)
      const bookingRef = res.tickets?.[0]?.bookingReference || '';
      if (bookingRef) {
        ticketApi.sendETicket(bookingRef).catch(() => { });
      }
      // navigate to booking success page showing booking ref
      navigate(`/booking-success?ref=${bookingRef}`);
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Booking failed');
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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Đặt chỗ</h1>

      {loading && <div>Đang xử lý...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {flight && (
        <div className="bg-white p-6 rounded-md shadow">
          {/* Step indicator */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`px-3 py-1 rounded ${step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>1. Xác nhận</div>
            <div className={`px-3 py-1 rounded ${step === 'passenger' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>2. Hành khách</div>
            <div className={`px-3 py-1 rounded ${step === 'seats' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>3. Chỗ ngồi</div>
            <div className={`px-3 py-1 rounded ${step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>4. Xác nhận</div>
          </div>

          {/* Review / Itinerary */}
          {step === 'review' && (
            <div>
              <div className="mb-4">
                <div className="text-lg font-semibold">{flight.flightNumber} — {flight.aircraft?.name}</div>
                <div className="text-sm text-gray-600">{flight.departureAirport?.iataCode} → {flight.arrivalAirport?.iataCode} • {new Date(flight.departureTime).toLocaleString()}</div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Hạng giá đã chọn</label>
                <div className="flex gap-2 items-center">
                  <div className="px-3 py-2 border rounded-md font-medium">{selectedSeatClass?.seatClass || '—'}</div>
                  <div className="px-3 py-2 border rounded-md">{pricePerSeat.toLocaleString()}₫ / hành khách</div>
                  <div className="px-3 py-2 border rounded-md">Tổng: <strong>{totalPrice.toLocaleString()}₫</strong></div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowItinerary(true)} className="px-3 py-2 border rounded-md">Chi tiết hành trình</button>
                <button onClick={goBackToSelect} className="px-3 py-2 border rounded-md">Thay đổi chuyến bay</button>
                <button onClick={() => {
                  if (user) return setStep('passenger');
                  navigate('/login', { state: { from: location } });


                }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Đăng nhập và tiếp tục</button>
              </div>

              {showItinerary && (
                <div className="mt-4 border p-4 rounded bg-gray-50">
                  <h4 className="font-medium mb-2">Thông tin hành trình</h4>
                  <div>Chuyến bay: {flight.flightNumber}</div>
                  <div>Máy bay: {flight.aircraft?.name}</div>
                  <div>Khởi hành: {flight.departureAirport?.city} ({flight.departureAirport?.iataCode}) — {new Date(flight.departureTime).toLocaleString()}</div>
                  <div>Đến: {flight.arrivalAirport?.city} ({flight.arrivalAirport?.iataCode}) — {new Date(flight.arrivalTime).toLocaleString()}</div>
                  <div className="mt-2 text-sm text-gray-600">Điều kiện vé: {selectedSeatClass?.fareRules || 'Xem chi tiết giá vé'}</div>
                  <div className="flex justify-end mt-3">
                    <button onClick={() => setShowItinerary(false)} className="px-3 py-2 border rounded-md">Đóng</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Passenger info */}
          {step === 'passenger' && (
            <div>
              <h3 className="font-medium mb-2">Nhập thông tin hành khách</h3>
              {passengerData.map((p, idx) => (
                <div key={idx} className="mb-2">
                  <label className="block text-sm text-gray-600">Hành khách {idx + 1}</label>
                  <input value={p.fullName} onChange={(e) => {
                    const arr = [...passengerData];
                    arr[idx].fullName = e.target.value;
                    setPassengerData(arr);
                  }} className="w-full border px-2 py-1 rounded-md mb-1" />
                  <input value={p.email || ''} onChange={(e) => {
                    const arr = [...passengerData];
                    arr[idx].email = e.target.value;
                    setPassengerData(arr);
                  }} placeholder="Email (tùy chọn)" className="w-full border px-2 py-1 rounded-md text-sm" />
                </div>
              ))}

              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setStep('review')} className="px-3 py-2 border rounded-md">Quay lại</button>
                <button onClick={async () => {
                  // only allow logged-in users to proceed to seat selection
                  if (!user) {
                    navigate('/login', { state: { from: location } });
                    return;
                  }

                  setStep('seats');
                }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Tiếp tục</button>
              </div>
            </div>
          )}

          {/* Seat selection (extras) */}
          {step === 'seats' && (
            <div>
              <h3 className="font-medium mb-2">Chọn chỗ ngồi — ({selectedSeats.length}/{passengerData.length})</h3>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {availableSeats.map(s => (
                  <button key={s.id}
                    onClick={() => toggleSeat(s.id)}
                    disabled={s.isBooked || s.isLocked}
                    className={`px-2 py-1 border rounded text-sm ${selectedSeats.includes(s.id) ? 'bg-blue-600 text-white' : s.isBooked ? 'bg-red-100 text-red-600 cursor-not-allowed' : s.isLocked ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' : ''}`}>
                    {s.seatNumber}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <button onClick={handleLockSeats} disabled={loading} className="px-4 py-2 bg-yellow-500 text-black rounded-md mr-2">Khoá ghế</button>
                <button onClick={() => {
                  if (selectedSeats.length !== passengerData.length) return alert('Vui lòng chọn đủ ghế');
                  // Ensure seats are locked by current user
                  const unlocked = selectedSeats.filter(id => !lockedSeats.includes(id));
                  if (unlocked.length > 0) return alert('Vui lòng khoá ghế trước khi tiếp tục');
                  setStep('confirm');
                }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Tiếp tục</button>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirm' && (
            <div>
              <h3 className="font-medium mb-2">Xác nhận đặt chỗ</h3>
              <div className="mb-2">Tổng tiền: <strong>{totalPrice.toLocaleString()}₫</strong></div>
              <div className="mb-4">
                <div className="font-medium mb-1">Hành khách & ghế</div>
                {selectedSeats.map((sId, idx) => {
                  const seat = availableSeats.find(s => s.id === sId) || { seatNumber: '—' };
                  return (<div key={sId}>{passengerData[idx]?.fullName || '—'} — Ghế: {seat.seatNumber}</div>);
                })}
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={() => setStep('seats')} className="px-3 py-2 border rounded-md">Quay lại</button>
                <button onClick={handleConfirm} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md">Xác nhận và gửi email</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
