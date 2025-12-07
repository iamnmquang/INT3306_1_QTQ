import React, { useState } from 'react';

export default function SearchForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [depart, setDepart] = useState('');
  const [passengers, setPassengers] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // demo: chuyển sang trang kết quả hoặc gọi API
    alert(`Tìm chuyến: ${from} -> ${to}\nNgày: ${depart}\nHành khách: ${passengers}`);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="field">
        <label>Điểm đi</label>
        <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Hà Nội (HAN)" />
      </div>

      <div className="field">
        <label>Điểm đến</label>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="TP. Hồ Chí Minh (SGN)" />
      </div>

      <div className="field">
        <label>Ngày đi</label>
        <input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} />
      </div>

      <div className="field">
        <label>Hành khách</label>
        <select value={passengers} onChange={(e) => setPassengers(e.target.value)}>
          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} người</option>)}
        </select>
      </div>

      <div className="field action">
        <button type="submit" className="btn btn-primary">Tìm chuyến bay</button>
      </div>
    </form>
  );
}
