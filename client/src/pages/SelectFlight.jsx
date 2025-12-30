import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flightApi } from '../api/flightApi';
import Filters from '../components/flights/Filters';
import FlightList from '../components/flights/FlightList';

export default function SelectFlight() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const departureCity = params.get('from') || '';
  const arrivalCity = params.get('to') || '';
  const departureTime = params.get('date') || '';
  const passengerNum = Number(params.get('passengers') || 1);

  const [flights, setFlights] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const normalizeParam = (s) => {
      if (!s) return s;
      const m = s.match(/\(([A-Z]{3})\)/i);
      if (m) return m[1]; // use IATA
      if (/^[A-Z]{3}$/i.test(s.trim())) return s.trim().toUpperCase();
      return s;
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const dep = normalizeParam(departureCity);
        const arr = normalizeParam(arrivalCity);
        const res = await flightApi.search({ departureCity: dep, arrivalCity: arr, departureTime, passengerNum });
        if (!mounted) return;
        setFlights(res);
        setFiltered(res);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Không thể tìm chuyến');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Only search when required params are present
    if (departureCity && arrivalCity && departureTime) {
      load();
    } else {
      setFlights([]);
      setFiltered([]);
    }

    return () => (mounted = false);
  }, [departureCity, arrivalCity, departureTime, passengerNum]);

  const applyFilters = (opts) => {
    let arr = [...flights];

    // Price filter
    if (opts.minPrice !== undefined && opts.maxPrice !== undefined) {
      arr = arr.filter(f => {
        const min = getMinPrice(f);
        return min >= opts.minPrice && min <= opts.maxPrice;
      });
    }

    // Time range filter (opts.startTime, opts.endTime in HH:MM)
    if (opts.startTime && opts.endTime) {
      const toMinutes = (timeStr) => {
        const [hh, mm] = timeStr.split(':').map(Number);
        return hh * 60 + mm;
      };
      const start = toMinutes(opts.startTime);
      const end = toMinutes(opts.endTime);

      arr = arr.filter(f => {
        const d = new Date(f.departureTime);
        const minutes = d.getHours() * 60 + d.getMinutes();
        if (start <= end) {
          return minutes >= start && minutes <= end;
        }
        // wrap-around (e.g., 22:00 - 04:00)
        return minutes >= start || minutes <= end;
      });
    }

    // Filter by stops if provided (not supported by backend yet)
    if (opts.stops !== undefined && opts.stops !== null) {
      // If flights had stops property, we would filter here. For now, ignore.
    }

    // Sort
    if (opts.sort === 'price-asc') {
      arr.sort((a, b) => (getMinPrice(a) - getMinPrice(b)));
    } else if (opts.sort === 'price-desc') {
      arr.sort((a, b) => (getMinPrice(b) - getMinPrice(a)));
    } else if (opts.sort === 'time-asc') {
      arr.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    }

    setFiltered(arr);
  };

  const getMinPrice = (flight) => {
    if (!flight.flightSeats || flight.flightSeats.length === 0) return Infinity;
    return Math.min(...flight.flightSeats.map(fs => fs.price));
  };

  const handleSelect = (flight, flightSeatId) => {
    // include original search params so user can go back and change flight; pass flight object in state to avoid extra fetch
    const q = new URLSearchParams({ from: departureCity, to: arrivalCity, date: departureTime, passengers: passengerNum }).toString();
    navigate(`/book?flightId=${flight.id}&flightSeatId=${flightSeatId}&passengers=${passengerNum}&${q}`, { state: { flight } });
  }; 

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-4">Chọn chuyến bay</h1>

      <div className="mb-4">
        <strong>Hành trình:</strong> {departureCity} → {arrivalCity} — {departureTime} • {passengerNum} khách
      </div>

      <div className="flex gap-6">
        <div className="w-72">
          <Filters onChange={applyFilters} />
        </div>

        <div className="flex-1">
          {loading && <div>Đang tải chuyến bay…</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <>
              {filtered.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
                  <div className="font-medium text-yellow-800 mb-1">Không tìm thấy chuyến phù hợp</div>
                  <div className="text-sm text-yellow-700">Gợi ý: kiểm tra lại điểm đi/điểm đến (hãy chọn từ danh sách gợi ý), hoặc thử ngày khác hoặc mở rộng khoảng giá.</div>
                </div>
              ) : (
                <FlightList flights={filtered} onSelect={handleSelect} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}