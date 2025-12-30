import React from 'react';

export default function Modal({ title, children, open, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-3xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>✕</button>
        </div>

        <div className="mb-4">{children}</div>

        {footer && <div className="border-t pt-3">{footer}</div>}
      </div>
    </div>
  );
}