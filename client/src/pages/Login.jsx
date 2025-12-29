import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/apiServices";
import "../styles/Login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password) {
            setError("Vui lòng nhập email và mật khẩu.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await loginUser({ email, password });

            console.log("LOGIN RESPONSE:", res.data);

            const accessToken = res.data?.accessToken || res.data?.token;
            const user = res.data?.user;

            if (!accessToken || !user) {
                throw new Error("Server không trả đủ dữ liệu đăng nhập.");
            }

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("isLoggedIn", "true");

            window.dispatchEvent(new Event("userLogin"));
            navigate("/");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Đăng nhập thất bại.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="login-page">
            <div className="login-card" role="main" aria-labelledby="login-title">
                <h2 id="login-title" className="login-title">Login</h2>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="field-label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        className="field-input"
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label className="field-label" htmlFor="password">Password</label>
                    <input
                        id="password"
                        className="field-input"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    <div className="forgot-row">
                        <Link className="forgot-link" to="/forgot-password">Forget Password</Link>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button className="btn-primary" type="submit" disabled={isLoading}>
                        {isLoading ? "Đang xử lý..." : "Login"}
                    </button>

                    <div className="register-row">
                        <span>No account yet? </span>
                        <Link className="register-link" to="/register">Register</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}