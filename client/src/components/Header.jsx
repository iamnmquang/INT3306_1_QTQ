import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  /* 🔥 STATE */
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  /* 🔥 SYNC HEADER KHI USER THAY ĐỔI */
  useEffect(() => {
    const syncAuth = () => {
      const storedUser = localStorage.getItem("user");

      setUser(storedUser ? JSON.parse(storedUser) : null);
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    window.addEventListener("userLogin", syncAuth);
    window.addEventListener("userLogout", syncAuth);
    window.addEventListener("userUpdate", syncAuth);

    return () => {
      window.removeEventListener("userLogin", syncAuth);
      window.removeEventListener("userLogout", syncAuth);
      window.removeEventListener("userUpdate", syncAuth);
    };
  }, []);

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
              <button className="btn btn-outline" onClick={() => navigate("/login")}>
                Đăng nhập
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/register")}>
                Đăng ký
              </button>
            </>
          ) : (
            <div className="user-menu" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="/images/User.png"
                alt="User avatar"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />


              <span style={{ fontWeight: "bold" }}>
                {user?.name || "User"}
              </span>

              <button
                className="btn btn-outline"
                onClick={() => navigate("/support-chat")}
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
