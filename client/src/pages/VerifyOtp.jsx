import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Services
// Lưu ý: Hãy chắc chắn tên file import khớp với file bạn tạo (apiService hay apiServices)
import { verifyOtp } from "../services/apiServices";

// Styles
import "./Register.css";

export default function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Lấy email từ state được truyền qua navigate() từ trang Register
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // 1. Kiểm tra nếu không có email (User vào thẳng URL mà không qua bước đăng ký)
        if (!email) {
            setError("Phiên không hợp lệ. Vui lòng thử đăng ký lại.");
            setIsLoading(false);
            return;
        }

        // 2. Validate OTP client-side
        if (otp.length < 6) {
            setError("OTP phải có 6 chữ số.");
            setIsLoading(false);
            return;
        }

        try {
            // 3. Gọi API xác thực
            await verifyOtp({
                email: email,
                otp: otp,
            });

            // 4. Xử lý thành công
            alert("Xác thực tài khoản thành công! Bạn sẽ được chuyển đến trang đăng nhập.");
            navigate("/login");

        } catch (apiError) {
            // 5. Xử lý lỗi từ server
            console.error("Lỗi xác thực OTP:", apiError);
            const message = apiError.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn.";
            setError(message);
        } finally {
            // Luôn tắt loading dù thành công hay thất bại
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" role="main" aria-labelledby="verify-title">
                <h2 id="verify-title" className="auth-title">
                    Verify Your Account
                </h2>

                <p className="auth-subtitle">
                    Chúng tôi đã gửi một mã OTP 6 số đến
                    <strong> {email || "email của bạn"}</strong>.
                </p>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <label className="field-label" htmlFor="otp">
                        Enter OTP
                    </label>
                    <input
                        id="otp"
                        className="field-input"
                        type="tel"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        autoComplete="one-time-code"
                        required
                    />

                    {/* Hiển thị lỗi nếu có */}
                    {error && <p className="error-message">{error}</p>}

                    <button className="btn-primary" type="submit" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}