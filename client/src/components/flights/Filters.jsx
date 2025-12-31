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
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-semibold text-lg mb-5 text-slate-800">
        Bộ lọc & Sắp xếp
      </h3>

      {/* Price range */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Khoảng giá
        </label>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            className="w-1/2 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            min={propMinPrice}
            max={propMaxPrice}
          />
          <input
            type="number"
            className="w-1/2 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            min={propMinPrice}
            max={propMaxPrice}
          />
        </div>

        <div className="space-y-2 mb-2">
          <input
            type="range"
            min={propMinPrice}
            max={propMaxPrice}
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className="w-full accent-indigo-600"
          />
          <input
            type="range"
            min={propMinPrice}
            max={propMaxPrice}
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className="w-full accent-indigo-600"
          />
        </div>

        <div className="text-sm text-slate-500">
          {Number(minPrice).toLocaleString()}₫ — {Number(maxPrice).toLocaleString()}₫
        </div>
      </div>

      {/* Time range */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Giờ khởi hành
        </label>
        <div className="flex gap-2">
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-1/2 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="w-1/2 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Sắp xếp theo
        </label>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="price-asc">Giá thấp → cao</option>
          <option value="price-desc">Giá cao → thấp</option>
          <option value="time-asc">Giờ đi sớm → muộn</option>
        </select>
      </div>

      {/* Stops */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Điểm dừng
        </label>
        <select
          value={stops}
          onChange={e => setStops(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="any">Bất kỳ</option>
          <option value="0">Bay thẳng</option>
          <option value="1">1 điểm dừng</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={apply}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition"
        >
          Áp dụng
        </button>
        <button
          onClick={reset}
          className="flex-1 border border-slate-300 hover:bg-slate-50 py-2.5 rounded-xl font-medium transition"
        >
          Reset
        </button>
      </div>
    </div>
  );

}