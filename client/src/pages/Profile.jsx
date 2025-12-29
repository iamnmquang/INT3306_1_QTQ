import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Profile.css";

const API_URL = "http://localhost:4000/users";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: ""
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("accessToken");

    /* ================= FETCH PROFILE ================= */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!token) {
                    setError("Bạn chưa đăng nhập");
                    return;
                }

                const res = await axios.get(`${API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(res.data);

                localStorage.setItem("user", JSON.stringify(res.data));
                window.dispatchEvent(new Event("userUpdate"));

                setForm({
                    name: res.data.name || "",
                    phone: res.data.phone || "",
                    address: res.data.address || ""
                });
            } catch {
                setError("Không thể tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    /* ================= UPDATE PROFILE ================= */
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await axios.put(
                `${API_URL}/profile`,
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            window.dispatchEvent(new Event("userUpdate"));

            setMessage("✅ Cập nhật thông tin thành công");
        } catch {
            setError("❌ Cập nhật thông tin thất bại");
        }
    };

    /* ================= CHANGE PASSWORD ================= */
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await axios.put(
                `${API_URL}/profile/password`,
                passwordForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPasswordForm({ oldPassword: "", newPassword: "" });
            setMessage("✅ Đổi mật khẩu thành công");
        } catch (err) {
            setError(
                err.response?.data?.message || "❌ Đổi mật khẩu thất bại"
            );
        }
    };

    /* ================= UI ================= */
    if (loading) return <p>Đang tải thông tin...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="profile-container">
            <h2>👤 Hồ sơ cá nhân</h2>

            {message && <p className="success">{message}</p>}

            {/* ===== AVATAR (MẶC ĐỊNH) ===== */}
            <div className="profile-avatar">
                <img
                    src="/images/User.png"
                    alt="avatar"
                />
            </div>

            {/* ===== BASIC INFO ===== */}
            <form className="profile-form" onSubmit={handleUpdateProfile}>
                <label>Họ tên</label>
                <input
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                <label>Email</label>
                <input value={user.email} disabled />

                <label>Số điện thoại</label>
                <input
                    value={form.phone}
                    onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                    }
                />

                <label>Địa chỉ</label>
                <input
                    value={form.address}
                    onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                    }
                />

                <button type="submit">💾 Lưu thông tin</button>
            </form>

            {/* ===== PASSWORD ===== */}
            <form className="password-form" onSubmit={handleChangePassword}>
                <h3>🔐 Đổi mật khẩu</h3>

                <input
                    type="password"
                    placeholder="Mật khẩu cũ"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                        setPasswordForm({
                            ...passwordForm,
                            oldPassword: e.target.value
                        })
                    }
                />

                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                        setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value
                        })
                    }
                />

                <button type="submit">Đổi mật khẩu</button>
            </form>
        </div>
    );
}
