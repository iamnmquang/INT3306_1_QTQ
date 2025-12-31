import React, { useState } from 'react';
import FareDetailsModal from './FareDetailsModal';

function formatTime(dt) {
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function minPrice(flight) {
  if (!flight.flightSeats || flight.flightSeats.length === 0) return '-';
  return Math.min(...flight.flightSeats.map(fs => fs.price));
}

export default function FlightItem({ flight, onSelect }) {
  const [selectedSeatClass, setSelectedSeatClass] = useState(flight.flightSeats?.[0]?.id || null);
  const [showFare, setShowFare] = useState(false);

  if (!flight) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col lg:flex-row gap-6">
      {/* Left: Flight info */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="text-lg font-semibold text-slate-800">
            {flight.flightNumber}
          </div>
          <div className="text-slate-400">•</div>
          <div className="text-sm text-slate-600">
            {flight.aircraft?.name || '—'}
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="font-medium text-slate-800">
            {flight.departureAirport?.iataCode}
          </span>
          <span className="text-slate-500">
            {formatTime(flight.departureTime)}
          </span>

          <span className="text-slate-400">→</span>

          <span className="font-medium text-slate-800">
            {flight.arrivalAirport?.iataCode}
          </span>
          <span className="text-slate-500">
            {formatTime(flight.arrivalTime)}
          </span>
        </div>

        {/* Seat classes */}
        <div className="mt-4 flex flex-wrap gap-3">
          {flight.flightSeats?.map(fs => {
            const active = selectedSeatClass === fs.id;
            return (
              <button
                key={fs.id}
                onClick={() => setSelectedSeatClass(fs.id)}
                className={`px-4 py-2 rounded-xl border text-sm transition
                ${active
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                    : 'border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
              >
                <div className="font-medium capitalize">{fs.seatClass}</div>
                <div className={`text-xs ${active ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {fs.price.toLocaleString()}₫
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Price & actions */}
      <div className="w-full lg:w-64 flex flex-col justify-between items-end gap-3">
        <div className="text-right">
          <div className="text-sm text-slate-500 mb-1">Giá từ</div>
          <div className="text-2xl font-bold text-indigo-600">
            {minPrice(flight).toLocaleString()}₫
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => setShowFare(true)}
            className="w-full border border-slate-300 hover:bg-slate-50 py-2 rounded-xl text-sm font-medium transition"
          >
            Xem điều kiện giá
          </button>
          <button
            onClick={() => onSelect(flight, selectedSeatClass)}
            disabled={!selectedSeatClass}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition
            ${selectedSeatClass
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
          >
            Chọn chuyến bay
          </button>
        </div>
      </div>

      {showFare && (
        <FareDetailsModal
          flight={flight}
          seatClassId={selectedSeatClass}
          onClose={() => setShowFare(false)}
        />
      )}
    </div>
  );

}