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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* ===== LOGO ===== */}
          <div
            onClick={handleHomeClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl">
                ✈️
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent hidden sm:block">
              QTQAirline
            </span>
          </div>

          {/* ===== NAVIGATION ===== */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Trang chủ", path: "/home", onClick: handleHomeClick },
              { label: "Lịch bay", path: "/my-flights", onClick: () => navigate("/my-flights") },
              { label: "Tin mới", path: "/promotions", onClick: () => navigate("/promotions") },
              { label: "Hỗ trợ", path: "/support-chat", onClick: () => navigate("/support-chat") },
            ].map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all
                  ${isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* ===== AUTH ===== */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="hidden sm:flex px-4 py-2 rounded-xl text-sm font-medium
    text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Đăng nhập
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-xl text-sm font-medium
    text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Đăng ký
                </button>
              </>

            ) : (
              /* ===== USER DROPDOWN ===== */
              <div className="relative group">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-xl
                hover:bg-slate-100 transition"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block font-medium text-slate-700">
                    {user?.name || "User"}
                  </span>
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl
                border border-slate-200 shadow-lg
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all"
                >
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full text-left px-4 py-2.5 text-sm
                  hover:bg-slate-100 rounded-t-xl"
                  >
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm
                  text-red-600 hover:bg-red-50 rounded-b-xl"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )


}
