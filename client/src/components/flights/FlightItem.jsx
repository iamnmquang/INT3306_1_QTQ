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
    <div className="bg-white rounded-md shadow p-4 flex items-start justify-between">
      <div>
        <div className="text-lg font-semibold">{flight.flightNumber} • {flight.aircraft?.name}</div>
        <div className="text-sm text-gray-600">{flight.departureAirport?.iataCode} ({formatTime(flight.departureTime)}) → {flight.arrivalAirport?.iataCode} ({formatTime(flight.arrivalTime)})</div>
        <div className="mt-2 flex gap-3">
          {flight.flightSeats?.map(fs => (
            <button key={fs.id}
              onClick={() => setSelectedSeatClass(fs.id)}
              className={`px-3 py-1 border rounded-md ${selectedSeatClass === fs.id ? 'bg-blue-600 text-white' : ''}`}>
              {fs.seatClass} • {fs.price.toLocaleString()}₫
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="text-right text-xl font-semibold">{minPrice(flight).toLocaleString()}₫</div>
        <div className="text-sm text-gray-500">Giá hiển thị là từ</div>
        <div className="flex gap-2">
          <button onClick={() => setShowFare(true)} className="px-3 py-2 border rounded-md">Xem điều kiện giá</button>
          <button onClick={() => onSelect(flight, selectedSeatClass)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Xác nhận và tiếp tục</button>
        </div>
      </div>

      {showFare && (
        <FareDetailsModal flight={flight} seatClassId={selectedSeatClass} onClose={() => setShowFare(false)} />
      )}
    </div>
  );
}