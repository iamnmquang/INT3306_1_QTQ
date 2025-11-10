import React, { useState } from "react";
import "./Register.css"; // CSS dùng chung cho login & register

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Thêm logic validate / call API ở đây
        if (!username.trim() || !email.trim() || !password) {
            alert("Vui lòng điền đủ thông tin.");
            return;
        }
        console.log("Đăng ký:", { username, email, password });
        alert("Đăng ký demo thành công!");
    };

    return (
        <div className="auth-page">
            <div className="auth-card" role="main" aria-labelledby="register-title">
                <h2 id="register-title" className="auth-title">Register</h2>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <label className="field-label" htmlFor="username">Username</label>
                    <input
                        id="username"
                        className="field-input"
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />

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
                        autoComplete="new-password"
                        required
                    />

                    <button className="btn-primary" type="submit">Register</button>

                    <div className="switch-row">
                        <span>Already have an account? </span>
                        <a className="switch-link" href="/login">Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
