import React from 'react';
import FlightItem from './FlightItem';

export default function FlightList({ flights, onSelect }) {
  if (!flights || flights.length === 0) {
    return <div className="text-gray-600">Không có chuyến nào phù hợp.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Tìm thấy <span className="font-semibold text-slate-800">{flights.length}</span> chuyến bay
        </div>
      </div>

      {/* List */}
      <div className="space-y-5">
        {flights.map(f => (
          <div
            key={f.id}
            className="transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <FlightItem flight={f} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  );

}