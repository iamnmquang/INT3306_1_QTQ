import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Nhấn trang chủ
  const handleHomeClick = () => {
    if (location.pathname === "/") {
      // Đã ở trang chủ → cuộn tới #home
      window.location.hash = "home";
    } else {
      // Không ở trang chủ → điều hướng về trang chủ và nhảy tới #home
      navigate("/#home");
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo">QTQAirline</div>

        <nav className="nav">
          <button
            onClick={handleHomeClick}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Trang chủ
          </button>
          <a href="#schedule">Lịch bay</a>
          <a href="#promo">Khuyến mãi</a>
          <a href="#support">Hỗ trợ</a>
        </nav>

        <div className="auth">
          <button className="btn btn-outline" onClick={handleLoginClick}>Đăng nhập</button>
          <button className="btn btn-outline" onClick={() => navigate('/register')}>Đăng ký</button>
        </div>
      </div>
    </header>
  );
}
