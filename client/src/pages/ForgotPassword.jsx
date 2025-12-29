import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/apiServices";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError("Vui lòng nhập email.");
            return;
        }

        setLoading(true);
        try {
            await forgotPassword({ email });
            navigate("/verify-forgot-otp", { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || "Không gửi được OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Quên mật khẩu</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Nhập email đăng ký"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button disabled={loading}>
                        {loading ? "Đang gửi OTP..." : "Gửi OTP"}
                    </button>
                </form>
            </div>
        </div>
    );
}
