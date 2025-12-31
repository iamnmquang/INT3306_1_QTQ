import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { airportApi } from '../../api/airportApi';

export default function SearchForm() {
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromIata, setFromIata] = useState("");
  const [toIata, setToIata] = useState("");
  const [depart, setDepart] = useState("");
  const [passengers, setPassengers] = useState(1);

  const [airports, setAirports] = useState([]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const navigate = useNavigate();
  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await airportApi.getAll();
        if (!mounted) return;
        setAirports(data);
      } catch (err) {
        // ignore
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleFromChange = (val) => {
    setFromText(val);
    setFromCity("");
    if (!val) return setFromSuggestions([]);
    const q = val.toLowerCase();
    const matches = airports.filter(a => (
      (a.city || '').toLowerCase().includes(q) ||
      (a.name || '').toLowerCase().includes(q) ||
      (a.iataCode || '').toLowerCase().includes(q)
    )).slice(0, 8);
    setFromSuggestions(matches);
  };

  const handleToChange = (val) => {
    setToText(val);
    setToCity("");
    if (!val) return setToSuggestions([]);
    const q = val.toLowerCase();
    const matches = airports.filter(a => (
      (a.city || '').toLowerCase().includes(q) ||
      (a.name || '').toLowerCase().includes(q) ||
      (a.iataCode || '').toLowerCase().includes(q)
    )).slice(0, 8);
    setToSuggestions(matches);
  };

  const selectFrom = (airport) => {
    setFromText(`${airport.city} (${airport.iataCode})`);
    setFromCity(airport.city);
    setFromIata(airport.iataCode);
    setFromSuggestions([]);
  };

  const selectTo = (airport) => {
    setToText(`${airport.city} (${airport.iataCode})`);
    setToCity(airport.city);
    setToIata(airport.iataCode);
    setToSuggestions([]);
  };

  const isValid =
  fromIata &&
  toIata &&
  fromIata !== toIata &&
  depart &&
  passengers > 0;


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValid) return;

    const from = fromCity || fromIata || fromText;
    const to = toCity || toIata || toText;
    const q = new URLSearchParams({ from, to, date: depart, passengers }).toString();
    navigate(`/select-flight?${q}`);
  };

  // Hide suggestions on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (fromRef.current && !fromRef.current.contains(e.target)) setFromSuggestions([]);
      if (toRef.current && !toRef.current.contains(e.target)) setToSuggestions([]);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
    >
      {/* From */}
      <div className="flex flex-col relative" ref={fromRef}>
        <label className="text-sm font-medium mb-1 text-gray-700">
          Điểm đi
        </label>
        <input
          value={fromText}
          onChange={(e) => handleFromChange(e.target.value)}
          placeholder="Hà Nội (HAN)"
          className="px-3 py-2 border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {fromSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow max-h-64 overflow-auto">
            {fromSuggestions.map(a => (
              <div key={a.id} onClick={() => selectFrom(a)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                <div className="font-medium">{a.city} • {a.iataCode}</div>
                <div className="text-xs text-gray-500">{a.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* To */}
      <div className="flex flex-col relative" ref={toRef}>
        <label className="text-sm font-medium mb-1 text-gray-700">
          Điểm đến
        </label>
        <input
          value={toText}
          onChange={(e) => handleToChange(e.target.value)}
          placeholder="TP. Hồ Chí Minh (SGN)"
          className="px-3 py-2 border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {toSuggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow max-h-64 overflow-auto">
            {toSuggestions.map(a => (
              <div key={a.id} onClick={() => selectTo(a)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                <div className="font-medium">{a.city} • {a.iataCode}</div>
                <div className="text-xs text-gray-500">{a.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1 text-gray-700">
          Ngày đi
        </label>
        <input
          type="date"
          value={depart}
          onChange={(e) => setDepart(e.target.value)}
          className="px-3 py-2 border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Passengers */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1 text-gray-700">
          Hành khách
        </label>
        <select
          value={passengers}
          onChange={(e) => setPassengers(parseInt(e.target.value))}
          className="px-3 py-2 border rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} người
            </option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <div className="flex items-end">
        <button
          type="submit"
          disabled={!isValid}
          className="w-full h-[42px] bg-blue-600 text-white
                   rounded-md font-semibold
                   hover:bg-blue-700 transition"
        >
          Tìm chuyến bay
        </button>
      </div>
    </form>
  );
}

