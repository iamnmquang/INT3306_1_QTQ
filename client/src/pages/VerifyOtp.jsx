import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Services
import { verifyOtp, resendOtp } from "../services/apiServices"; // ✅ nhớ import resendOtp

// Styles
import "../styles/Register.css";

export default function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cooldown, setCooldown] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email) {
            setError("Phiên không hợp lệ. Vui lòng thử đăng ký lại.");
            setIsLoading(false);
            return;
        }

        if (otp.length < 6) {
            setError("OTP phải có 6 chữ số.");
            setIsLoading(false);
            return;
        }

        try {
            await verifyOtp({ email, otp });
            alert("Xác thực tài khoản thành công! Bạn sẽ được chuyển đến trang đăng nhập.");
            navigate("/login");
        } catch (apiError) {
            const message = apiError.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            setError("Email không hợp lệ.");
            return;
        }

        if (cooldown > 0) return;

        setIsLoading(true);
        setError(null);

        try {
            await resendOtp({ email });
            alert("OTP đã được gửi lại. Vui lòng kiểm tra email.");

            // Bắt đầu cooldown 60s
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            const message = err.response?.data?.message || "Không thể gửi lại OTP";
            setError(message);
        } finally {
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

                    {error && <p className="error-message">{error}</p>}

                    <button className="btn-primary" type="submit" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify Account"}
                    </button>

                    <div className="resend-otp">
                        <p>
                            Chưa nhận được OTP?{" "}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={cooldown > 0 || isLoading}
                                className="link-btn"
                            >
                                {cooldown > 0 ? `Gửi lại (${cooldown}s)` : "Gửi lại OTP"}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
