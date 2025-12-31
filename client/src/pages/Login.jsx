import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Prefill email if passed via state or query
  const initialEmail =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { verified } = location.state || {};

  useEffect(() => {
    if (verified) setError(null);
  }, [verified]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ login trả về user
      const user = await login(email, password);

      /**
       * ƯU TIÊN:
       * 1. Nếu là ADMIN → vào admin
       * 2. Nếu có from (route bị chặn) → quay lại đó
       * 3. Mặc định → /
       */
      if (user?.role === "ADMIN") {
        navigate("/admin", { replace: true });
        return;
      }

      const fromLocation = location.state?.from;

      if (!fromLocation) {
        navigate("/", { replace: true });
      } else if (typeof fromLocation === "string") {
        navigate(fromLocation, { replace: true });
      } else {
        const toPath =
          (fromLocation.pathname || "/") +
          (fromLocation.search || "");
        navigate(toPath, {
          replace: true,
          state: fromLocation.state,
        });
      }
    } catch (err) {
      console.error("Login error", err);

      if (!err.response) {
        setError("Không kết nối tới server. Vui lòng kiểm tra mạng hoặc server.");
      } else {
        const data = err.response.data;
        const message =
          data?.message ||
          data?.error ||
          (data?.errors
            ? data.errors.map((e) => e.msg || e.message).join(", ")
            : null) ||
          `Lỗi server: ${err.response.status}`;

        setError(message || "Đăng nhập thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Đăng nhập</h2>
        <p className="text-center text-gray-500 mb-6">
          Đăng nhập để tiếp tục
        </p>

        {verified && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
            Tài khoản đã được xác thực — hãy đăng nhập.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-md font-semibold text-white ${isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          <div className="text-center text-sm mt-4">
            <span className="text-gray-600">Chưa có tài khoản?</span>{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Đăng ký
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
