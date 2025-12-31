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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10 relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Chọn chuyến bay của bạn
          </h1>

          {/* Journey summary */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-white/60 text-xs">Điểm đi</p>
                <p className="text-white font-semibold text-lg">
                  {departureCity || '---'}
                </p>
              </div>

              <div className="text-white/40 text-xl">→</div>

              <div>
                <p className="text-white/60 text-xs">Điểm đến</p>
                <p className="text-white font-semibold text-lg">
                  {arrivalCity || '---'}
                </p>
              </div>

              <div className="h-10 w-px bg-white/20 hidden md:block" />

              <div>
                <p className="text-white/60 text-xs">Ngày bay</p>
                <p className="text-white font-semibold">
                  {departureTime || '---'}
                </p>
              </div>

              <div className="h-10 w-px bg-white/20 hidden md:block" />

              <div>
                <p className="text-white/60 text-xs">Hành khách</p>
                <p className="text-white font-semibold">
                  {passengerNum} người
                </p>
              </div>

              <div className="ml-auto">
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/30 text-white hover:bg-white/20 transition"
                >
                  Tìm kiếm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <Filters onChange={applyFilters} />
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <svg
                    className="animate-spin h-8 w-8 text-indigo-600"
                    viewBox="0 0 24 24"
                  />
                </div>
                <p className="text-slate-600 font-medium">
                  Đang tìm chuyến bay phù hợp...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Đã xảy ra lỗi
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  Không tìm thấy chuyến bay
                </h3>
                <p className="text-amber-700 mb-4">
                  Hãy thử thay đổi ngày bay, điểm đi/đến hoặc bộ lọc giá.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                >
                  Tìm kiếm mới
                </button>
              </div>
            )}

            {/* List */}
            {!loading && !error && filtered.length > 0 && (
              <FlightList flights={filtered} onSelect={handleSelect} />
            )}
          </div>
        </div>
      </div>
    </div>
  );

}