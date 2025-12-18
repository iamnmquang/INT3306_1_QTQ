import { useState, useEffect } from "react";
import "./Profile.css";

const Profile = () => {
    const [tab, setTab] = useState("info");

    // ===== AVATAR STATE =====
    const [avatarPreview, setAvatarPreview] = useState("/avatar-default.png");
    const [avatarFile, setAvatarFile] = useState(null);

    // cleanup blob url
    useEffect(() => {
        return () => {
            if (avatarPreview.startsWith("blob:")) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Ảnh phải nhỏ hơn 2MB");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
        setAvatarFile(file);
    };

    return (
        <div className="profile-container">
            {/* Sidebar */}
            <aside className="profile-sidebar">
                <div className="profile-user">
                    <img src={avatarPreview} alt="avatar" />
                    <h3>Nguyễn Văn A</h3>
                    <p>user@email.com</p>
                </div>

                <ul>
                    <li className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>👤 Thông tin</li>
                    <li className={tab === "security" ? "active" : ""} onClick={() => setTab("security")}>🔐 Bảo mật</li>
                    <li className={tab === "payment" ? "active" : ""} onClick={() => setTab("payment")}>💳 Ngân hàng</li>
                    <li className={tab === "wallet" ? "active" : ""} onClick={() => setTab("wallet")}>👛 Ví điện tử</li>
                    <li className={tab === "flights" ? "active" : ""} onClick={() => setTab("flights")}>✈️ Lịch sử bay</li>
                    <li className={tab === "tickets" ? "active" : ""} onClick={() => setTab("tickets")}>🎟 Vé đã mua</li>
                </ul>
            </aside>

            {/* Content */}
            <main className="profile-content">
                {tab === "info" && (
                    <div className="profile-card">
                        <h2>Thông tin cá nhân</h2>

                        {/* AVATAR */}
                        <div className="avatar-section">
                            <label htmlFor="avatar-upload">
                                <img src={avatarPreview} alt="avatar" />
                            </label>

                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleAvatarChange}
                            />

                            <button
                                className="btn-secondary"
                                onClick={() =>
                                    document.getElementById("avatar-upload").click()
                                }
                            >
                                Đổi ảnh đại diện
                            </button>

                            <p className="avatar-hint">
                                JPG, PNG • Tối đa 2MB
                            </p>
                        </div>

                        <input placeholder="Họ tên" />
                        <input placeholder="Email" disabled value="user@email.com" />
                        <input placeholder="Số điện thoại" />

                        <button className="btn-primary">Lưu</button>
                    </div>
                )}

                {tab === "security" && (
                    <div className="profile-card">
                        <h2>Bảo mật</h2>
                        <input type="password" placeholder="Mật khẩu hiện tại" />
                        <input type="password" placeholder="Mật khẩu mới" />
                        <input type="password" placeholder="Nhập lại mật khẩu" />
                        <button className="btn-primary">Đổi mật khẩu</button>

                        <hr />

                        <input placeholder="Email mới" />
                        <button className="btn-secondary">Gửi OTP</button>
                    </div>
                )}

                {tab === "payment" && (
                    <div className="profile-card">
                        <h2>Tài khoản ngân hàng</h2>
                        <input placeholder="Tên ngân hàng" />
                        <input placeholder="Số tài khoản" />
                        <input placeholder="Chủ tài khoản" />
                        <button className="btn-primary">Lưu</button>
                    </div>
                )}

                {tab === "wallet" && (
                    <div className="profile-card">
                        <h2>Ví điện tử</h2>
                        <div className="wallet-item">
                            <span>Momo</span>
                            <button className="btn-secondary">Liên kết</button>
                        </div>
                        <div className="wallet-item">
                            <span>ZaloPay</span>
                            <button className="btn-secondary">Liên kết</button>
                        </div>
                    </div>
                )}

                {tab === "flights" && (
                    <div className="profile-card">
                        <h2>Lịch sử bay</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã</th>
                                    <th>Tuyến</th>
                                    <th>Ngày</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>VN123</td>
                                    <td>HAN → SGN</td>
                                    <td>10/10/2025</td>
                                    <td>Đã bay</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === "tickets" && (
                    <div className="profile-card">
                        <h2>Vé đã mua</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã vé</th>
                                    <th>Chuyến</th>
                                    <th>Giá</th>
                                    <th>Ngày</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#TK001</td>
                                    <td>VN123</td>
                                    <td>1.200.000đ</td>
                                    <td>01/10/2025</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
