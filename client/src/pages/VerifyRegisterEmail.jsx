import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";

export default function VerifyRegisterEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail =
    location.state?.email || new URLSearchParams(location.search).get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !otp.trim()) {
      setError("Vui lòng nhập email và mã OTP");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.verifyAccount(email, otp);
      setSuccess("Xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.");
      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login", { state: { verified: true, email } });
      }, 900);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError("Không kết nối tới server. Vui lòng kiểm tra mạng hoặc server.");
      } else {
        const data = err.response.data;
        const message =
          data?.message || data?.error || (data?.errors ? data.errors.map((e) => e.msg || e.message).join(", ") : null) ||
          `Lỗi server: ${err.response.status}`;
        setError(message || "Xác thực thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Xác thực Email</h2>
        <p className="text-center text-gray-500 mb-6">
          Nhập mã OTP đã gửi tới email để hoàn tất đăng ký
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{success}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-md font-semibold text-white ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transition"}`}>
            {isLoading ? "Đang xác thực..." : "Xác thực"}
          </button>

          <div className="text-center text-sm mt-4">
            <span className="text-gray-600">Chưa nhận mã?</span>{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Quay lại Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
