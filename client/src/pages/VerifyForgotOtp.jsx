import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyForgotOtp } from "../services/apiServices";

export default function VerifyForgotOtp() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError("Phiên không hợp lệ.");
            return;
        }

        if (otp.length !== 6) {
            setError("OTP phải có 6 chữ số.");
            return;
        }

        setLoading(true);
        try {
            await verifyForgotOtp({ email, otp });
            navigate("/reset-password", { state: { email, otp } });
        } catch (err) {
            setError(err.response?.data?.message || "OTP không hợp lệ.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Xác thực OTP</h2>
                <p>OTP đã gửi tới <b>{email}</b></p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="Nhập OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button disabled={loading}>
                        {loading ? "Đang xác thực..." : "Xác thực"}
                    </button>
                </form>
            </div>
        </div>
    );
}
