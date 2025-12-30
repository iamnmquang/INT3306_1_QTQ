import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function BookingSuccess() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref');

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!ref) return;
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/ticket/booking/${ref}`);
        if (!mounted) return;
        setTickets(data);
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [ref]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Đặt chỗ thành công</h1>
      <p className="mb-4">Mã đặt chỗ: <strong>{ref}</strong></p>

      {loading && <div>Đang tải…</div>}

      {!loading && tickets.length > 0 && (
        <div className="bg-white p-6 rounded-md shadow">
          {tickets.map(t => (
            <div key={t.id} className="mb-4 border-b pb-3">
              <div className="font-medium">{t.ticketNumber} — {t.passenger?.fullName}</div>
              <div className="text-sm text-gray-600">{t.flight?.flightNumber} • Ghế {t.seatNumber}</div>
            </div>
          ))}

          <div className="mt-4">
            <Link to="/" className="text-blue-600">Quay về trang chủ</Link>
          </div>
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div>Không tìm thấy vé nào cho mã đặt chỗ này.</div>
      )}
    </div>
  );
}