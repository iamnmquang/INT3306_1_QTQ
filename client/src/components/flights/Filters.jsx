import React, { useState, useEffect } from 'react';

export default function Filters({ onChange, minPrice: propMinPrice = 0, maxPrice: propMaxPrice = 1000000 }) {
  const [sort, setSort] = useState('price-asc');
  const [stops, setStops] = useState('any');

  // Price range state
  const [minPrice, setMinPrice] = useState(propMinPrice);
  const [maxPrice, setMaxPrice] = useState(propMaxPrice);

  // Time range (HH:MM) default whole day
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  useEffect(() => {
    setMinPrice(propMinPrice);
    setMaxPrice(propMaxPrice);
  }, [propMinPrice, propMaxPrice]);

  const apply = () => {
    onChange({ sort, stops, minPrice: Number(minPrice), maxPrice: Number(maxPrice), startTime, endTime });
  };

  const reset = () => {
    setSort('price-asc');
    setStops('any');
    setStartTime('00:00');
    setEndTime('23:59');
    setMinPrice(propMinPrice);
    setMaxPrice(propMaxPrice);
    onChange({ sort: 'price-asc', stops: 'any', minPrice: propMinPrice, maxPrice: propMaxPrice, startTime: '00:00', endTime: '23:59' });
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="font-medium mb-3">Bộ lọc & Sắp xếp</h3>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Khoảng giá</label>
        <div className="flex items-center gap-2 mb-2">
          <input type="number" className="w-1/2 border px-2 py-1 rounded-md" value={minPrice} onChange={e => setMinPrice(e.target.value)} min={propMinPrice} max={propMaxPrice} />
          <input type="number" className="w-1/2 border px-2 py-1 rounded-md" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min={propMinPrice} max={propMaxPrice} />
        </div>

        <div className="mb-3">
          <input type="range" min={propMinPrice} max={propMaxPrice} value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full" />
          <input type="range" min={propMinPrice} max={propMaxPrice} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full mt-1" />
        </div>

        <div className="text-sm text-gray-600 mb-2">Từ {Number(minPrice).toLocaleString()}₫ — Đến {Number(maxPrice).toLocaleString()}₫</div>
      </div>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Giờ đi (khoảng)</label>
        <div className="flex gap-2">
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-1/2 border px-2 py-1 rounded-md" />
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-1/2 border px-2 py-1 rounded-md" />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Sắp xếp</label>
        <select value={sort} onChange={e => setSort(e.target.value)} className="w-full border px-2 py-1 rounded-md">
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
          <option value="time-asc">Giờ đi: Sớm → Muộn</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">Điểm dừng</label>
        <select value={stops} onChange={e => setStops(e.target.value)} className="w-full border px-2 py-1 rounded-md">
          <option value="any">Bất kỳ</option>
          <option value="0">Trực tiếp (0 dừng)</option>
          <option value="1">1 điểm dừng</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={apply} className="flex-1 bg-blue-600 text-white py-2 rounded-md">Áp dụng</button>
        <button onClick={reset} className="flex-1 border py-2 rounded-md">Reset</button>
      </div>
    </div>
  );
}