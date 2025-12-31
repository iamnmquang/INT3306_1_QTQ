import React from 'react';

export default function FareDetailsModal({ flight, seatClassId, onClose }) {
  const seat = flight.flightSeats?.find(s => s.id === seatClassId);
  if (!seat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              Chi tiết giá vé
            </h3>
            <p className="text-sm text-slate-500 capitalize">
              Hạng ghế: {seat.seatClass}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Price Highlight */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
          <div className="text-sm text-indigo-600 mb-1">
            Giá vé
          </div>
          <div className="text-2xl font-bold text-indigo-700">
            {seat.price.toLocaleString()}₫
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-slate-700">
          <div className="flex justify-between">
            <span>Số ghế tổng</span>
            <span className="font-medium">{seat.totalSeats}</span>
          </div>

          <div className="border-t pt-3 mt-3 text-slate-600">
            <p className="text-sm leading-relaxed">
              Điều kiện hạng vé:
              <br />
              • Hoàn / hủy / đổi vé theo quy định của hãng bay.
              <br />
              • Phí thay đổi có thể phát sinh tùy thời điểm.
              <br />
              • Giá vé đã bao gồm thuế và phụ phí cơ bản.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

}