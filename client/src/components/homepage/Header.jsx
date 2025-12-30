import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  /*  Use AuthContext as single source of truth */
  const { user, logout, isAuthenticated } = useAuth();

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.location.hash = "home";
    } else {
      navigate("/home");
    }
  };

  const handleLogout = () => {
    // delegate to context so state / tokens / interceptors are cleaned up consistently
    logout();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={handleHomeClick}
        >
          QTQAirline
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <button className="text-gray-700 hover:text-blue-600 font-medium transition" onClick={handleHomeClick}>
            Trang chủ
          </button>
          <button className="text-gray-700 hover:text-blue-600 font-medium transition" onClick={() => navigate("/my-flights")}> 
            Lịch bay
          </button>
          <button className="text-gray-700 hover:text-blue-600 font-medium transition" onClick={() => navigate("/promotions")}>
            Khuyến mãi
          </button>
          <button className="text-gray-700 hover:text-blue-600 font-medium transition" onClick={() => navigate("/support")}>
            Hỗ trợ
          </button>
        </nav>

        {/* Auth */}
        <div>
          {!isAuthenticated ? (
            <div className="flex gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md
           hover:bg-gray-100 transition text-sm font-medium"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
              <button
                className="px-4 py-2 border border-gray-300 rounded-md
           hover:bg-gray-100 transition text-sm font-medium"
                onClick={() => navigate("/register")}
              >
                Đăng ký
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src="/images/User.png"
                alt="User avatar"
                className="w-10 h-10 rounded-full object-cover"
              />

              <span className="font-semibold">
                {user?.name || "User"}
              </span>

              <button
                className="px-4 py-2 border border-gray-300 rounded-md
           hover:bg-gray-100 transition text-sm font-medium"
                onClick={() => navigate("/support-chat")}
              >
                💬 Chat
              </button>

              <button
                className="px-4 py-2 border border-gray-300 rounded-md
           hover:bg-gray-100 transition text-sm font-medium"
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>

              <button
                className="btn-outline text-red-500 hover:bg-red-50"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
