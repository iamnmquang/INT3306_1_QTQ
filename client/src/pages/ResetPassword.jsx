import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/apiServices";
import "../styles/ResetPassword.css";
export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { email, otp } = location.state || {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!password || password.length < 6) {
            setError("Mật khẩu phải ít nhất 6 ký tự.");
            return;
        }

        if (password !== confirm) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ email, otp, newPassword: password });
            alert("Đổi mật khẩu thành công!");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Đặt lại mật khẩu</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button disabled={loading}>
                        {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
}
