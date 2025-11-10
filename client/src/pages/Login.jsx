import React from "react";
import "./Login.css";

export default function Login() {
    return (
        <div className="login-page">
            <div className="login-card" role="main" aria-labelledby="login-title">
                <h2 id="login-title" className="login-title">Login</h2>

                <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                    <label className="field-label" htmlFor="email">Email</label>
                    <input
                        id="email"
                        className="field-input"
                        type="email"
                        placeholder="Enter email"
                        autoComplete="email"
                        required
                    />

                    <label className="field-label" htmlFor="password">Password</label>
                    <input
                        id="password"
                        className="field-input"
                        type="password"
                        placeholder="Enter password"
                        autoComplete="current-password"
                        required
                    />

                    <div className="forgot-row">
                        <a className="forgot-link" href="#forgot">Forget Password</a>
                    </div>

                    <button className="btn-primary" type="submit">Login</button>

                    <div className="register-row">
                        <span>No account yet? </span>
                        <a className="register-link" href="/register">Register</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
