// Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/apiServices";
import "./Register.css";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username.trim() || !email.trim() || !password) {
            setError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Chuẩn bị dữ liệu gửi lên Backend
            const payload = {
                name: username,      // Backend yêu cầu field 'name' hoặc user data khác
                email: email,
                password: password
            };

            // 2. Gọi API đăng ký
            // Backend sẽ tạo user và gửi email OTP ngay lúc này
            await registerUser(payload);

            // 3. Thông báo nhẹ (tuỳ chọn)
            // alert("Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.");

            // 4. QUAN TRỌNG: Chuyển hướng sang trang nhập OTP
            // Truyền email qua 'state' để trang VerifyOtp.jsx tự động điền
            navigate("/verify-register-email", { state: { email: email } });

        } catch (err) {
            console.error("Register error (full):", err);

            // network error (no response)
            if (!err.response) {
                setError("Không kết nối tới server. Vui lòng kiểm tra mạng hoặc server đang chạy.");
            } else {
                // Có response từ server
                const data = err.response.data;
                // Các backend có thể trả nhiều cấu trúc: { message }, { error }, { errors: [...] }
                const message =
                    data?.message ||
                    data?.error ||
                    (Array.isArray(data?.errors) ? data.errors.map(e => e.msg || e.message).join(', ') : null) ||
                    `Lỗi server: ${err.response.status}`;

                setError(message || "Đăng ký thất bại!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Register</h2>
                <p className="auth-subtitle">Tạo tài khoản mới</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="field-label">Username</label>
                    <input
                        className="field-input"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label className="field-label">Email</label>
                    <input
                        className="field-input"
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="field-label">Password</label>
                    <input
                        className="field-input"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p className="error-message">{error}</p>}

                    <button className="btn-primary" type="submit" disabled={isLoading}>
                        {isLoading ? "Đang xử lý..." : "Register"}
                    </button>

                    <div className="switch-row">
                        <span>Already have an account?</span>
                        <Link className="switch-link" to="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}