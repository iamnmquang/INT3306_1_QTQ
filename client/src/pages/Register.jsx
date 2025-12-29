// Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/apiServices";
import "../styles/Register.css";

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

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                name: username,
                email: email,
                password: password
            };

            await registerUser(payload);

            navigate("/verify-register-email", { state: { email } });

        } catch (err) {
            console.error("Register error (full):", err);

            if (!err.response) {
                setError("Không kết nối tới server. Vui lòng kiểm tra mạng hoặc server đang chạy.");
            } else {
                const data = err.response.data;
                const message =
                    data?.message ||
                    data?.error ||
                    (Array.isArray(data?.errors)
                        ? data.errors.map(e => e.msg || e.message).join(", ")
                        : null) ||
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