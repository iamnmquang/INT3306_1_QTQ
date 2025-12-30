import React from 'react';
import FlightItem from './FlightItem';

export default function FlightList({ flights, onSelect }) {
  if (!flights || flights.length === 0) {
    return <div className="text-gray-600">Không có chuyến nào phù hợp.</div>;
  }

  return (
    <div className="space-y-4">
      {flights.map(f => (
        <FlightItem key={f.id} flight={f} onSelect={onSelect} />
      ))}
    </div>
  );
}