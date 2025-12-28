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

    window.dispatchEvent(new Event("userLogout"));

    navigate("/");
  };

  return (
    <header className="header">
      <div className="container header-inner">

        <div className="logo">QTQAirline</div>

        <nav className="nav">
          <button onClick={handleHomeClick} style={navBtnStyle}>Trang chủ</button>
          <button onClick={() => navigate("/schedule")} style={navBtnStyle}>Lịch bay</button>
          <button onClick={() => navigate("/promotions")} style={navBtnStyle}>Khuyến mãi</button>
          <button onClick={() => navigate("/support")} style={navBtnStyle}>Hỗ trợ</button>
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

              {/* 🔥 NÚT CHAT MỚI */}
              <button
                className="btn btn-outline"
                onClick={() => navigate("/support-chat")}
                title="Chat với hỗ trợ"
              >
                💬 Chat
              </button>

              <button className="btn btn-outline" onClick={() => navigate("/profile")}>
                Profile
              </button>

              <button className="btn btn-outline" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

const navBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  marginRight: "20px",
};
