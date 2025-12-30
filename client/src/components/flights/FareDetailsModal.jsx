import React from 'react';

export default function FareDetailsModal({ flight, seatClassId, onClose }) {
  const seat = flight.flightSeats?.find(s => s.id === seatClassId);
  if (!seat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-xl">
        <h3 className="text-lg font-semibold mb-3">Chi tiết giá vé — {seat.seatClass}</h3>
        <p className="mb-2">Giá: <strong>{seat.price.toLocaleString()}₫</strong></p>
        <p className="mb-2">Số ghế tổng: {seat.totalSeats}</p>
        <p className="mb-4 text-sm text-gray-600">Các điều kiện hạng vé: hoàn/hủy/đổi theo quy định (mô tả mẫu).</p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">Đóng</button>
        </div>
      </div>
    </div>
  );
}