import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy trạng thái login từ localStorage
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user"));

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.location.hash = "home";
    } else {
      navigate("/#home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/"); // trở lại trang chủ
  };

  return (
    <header className="header">
      <div className="container header-inner">

        <div className="logo">QTQAirline</div>

        <nav className="nav">
          <button onClick={handleHomeClick} style={{ background: "none", border: "none", cursor: "pointer", marginRight: "20px", }}>Trang chủ</button>
          <button onClick={() => navigate("/schedule")} style={{ background: "none", border: "none", cursor: "pointer", marginRight: "20px", }}>Lịch bay</button>
          <button onClick={() => navigate("/promotions")} style={{ background: "none", border: "none", cursor: "pointer", marginRight: "20px", }}>Khuyến mãi</button>
          <button onClick={() => navigate("/support")} style={{ background: "none", border: "none", cursor: "pointer", marginRight: "20px", }}>Hỗ trợ</button>
        </nav>

        <div className="auth">
          {!isLoggedIn ? (
            <>
              <button className="btn btn-outline" onClick={() => navigate("/login")}>Đăng nhập</button>
              <button className="btn btn-outline" onClick={() => navigate("/register")}>Đăng ký</button>
            </>
          ) : (
            <div className="user-menu" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={user?.avatar || "https://i.pravatar.cc/40"}
                alt="avatar"
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
              <span style={{ fontWeight: "bold" }}>{user?.name || "User"}</span>

              <button className="btn btn-outline" onClick={() => navigate("/profile")}>Profile</button>

              <button className="btn btn-outline" onClick={handleLogout}>Đăng xuất</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
