import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Profile.css";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("accessToken");

                if (!token) {
                    setError("Bạn chưa đăng nhập");
                    return;
                }

                const res = await axios.get(
                    "http://localhost:4000/users/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUser(res.data);
            } catch (err) {
                setError("Không thể tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <p>Đang tải thông tin...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="profile-container">
            <h2>👤 Thông tin cá nhân</h2>

            <div className="profile-card">
                <p><strong>Họ tên:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Vai trò:</strong> {user.role}</p>

                <p>
                    <strong>Trạng thái:</strong>{" "}
                    {user.isAccountVerified ? "Đã xác thực" : "Chưa xác thực"}
                </p>

                <p>
                    <strong>Ngày tạo:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}
