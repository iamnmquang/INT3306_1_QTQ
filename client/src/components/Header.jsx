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
            style={{ background: "none", border: "none", cursor: "pointer", marginRight: "20px", }}
          >
            Trang chủ
          </button>
          <button
            onClick={() => navigate('/schedule')}
            style={{ background: "none", border: "none", cursor: "pointer", marginRight: "20px", }}
          >
            Lịch bay
          </button>

          <button
            onClick={() => navigate('/promotions')}
            style={{ background: "none", border: "none", cursor: "pointer", marginRight: "20px", }}
          >
            Khuyến mãi
          </button>

          <button
            onClick={() => navigate('/support')}
            style={{ background: "none", border: "none", cursor: "pointer", marginRight: "20px", }}
          >
            Hỗ trợ
          </button>
        </nav>

        <div className="auth">
          <button className="btn btn-outline" onClick={handleLoginClick}>Đăng nhập</button>
          <button className="btn btn-outline" onClick={() => navigate('/register')}>Đăng ký</button>
        </div>
      </div>
    </header>
  );
}
