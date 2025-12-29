import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "../styles/Support.css";

/**
 * Demo data - thay bằng API thực tế khi cần
 */
const FAQS = [
    { id: 1, category: "Account", q: "Làm sao để đổi mật khẩu?", a: "Bạn vào Trang Cá Nhân → Đổi mật khẩu. Nếu quên mật khẩu, dùng chức năng 'Quên mật khẩu'." },
    { id: 2, category: "Billing", q: "Tôi bị trừ tiền nhưng không có vé?", a: "Vui lòng kiểm tra lịch sử giao dịch, nếu vẫn không khớp, gửi ticket kèm hóa đơn." },
    { id: 3, category: "Technical", q: "Trang web báo lỗi khi thanh toán", a: "Thử xóa cache hoặc dùng trình duyệt khác. Nếu lỗi tiếp, gửi ticket kèm ảnh lỗi." },
    { id: 4, category: "Account", q: "Làm sao để xóa tài khoản?", a: "Gửi yêu cầu tới bộ phận hỗ trợ qua ticket — chọn category Account và priority High." },
    { id: 5, category: "Other", q: "Khi nào tôi nhận được hoàn tiền?", a: "Thời gian hoàn tiền tuỳ ngân hàng, thường 3-7 ngày làm việc." },
];

const USER_TICKETS = [
    { id: "TKT-100001", subject: "Thanh toán failed", status: "Open", updatedAt: "2025-10-28" },
    { id: "TKT-100002", subject: "Yêu cầu hoàn tiền", status: "Pending", updatedAt: "2025-10-24" },
    { id: "TKT-100003", subject: "Lỗi đăng nhập", status: "Resolved", updatedAt: "2025-09-30" },
];

const CATEGORIES = ["All", "Account", "Billing", "Technical", "Other"];

export default function Support() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [openFaq, setOpenFaq] = useState(null);

    const faqsFiltered = useMemo(() => {
        return FAQS.filter(f => {
            const matchCategory = category === "All" || f.category === category;
            const matchQuery =
                query.trim() === "" ||
                f.q.toLowerCase().includes(query.toLowerCase()) ||
                f.a.toLowerCase().includes(query.toLowerCase());
            return matchCategory && matchQuery;
        });
    }, [query, category]);

    function toggleFaq(id) {
        setOpenFaq(prev => (prev === id ? null : id));
    }

    return (
        <div className="support-page">
            <div className="support-card">
                <header className="support-header">
                    <div>
                        <h1 className="support-title">Help & Support</h1>
                        <p className="support-sub">Tìm câu trả lời nhanh hoặc tạo ticket để nhận hỗ trợ.</p>
                    </div>

                    <div className="header-actions">
                        <Link to="/support/new" className="btn-primary small">Create Ticket</Link>
                    </div>
                </header>

                <section className="support-controls">
                    <div className="search-box">
                        <input
                            type="search"
                            placeholder="Search FAQs, keywords..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search support"
                        />
                    </div>

                    <div className="categories">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`cat-btn ${cat === category ? "active" : ""}`}
                                onClick={() => setCategory(cat)}
                                aria-pressed={cat === category}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                <main className="support-main">
                    <div className="faq-col">
                        <h3 className="col-title">Popular Questions</h3>
                        {faqsFiltered.length === 0 ? (
                            <div className="empty">Không tìm thấy kết quả. Thử từ khoá khác.</div>
                        ) : (
                            <ul className="faq-list" role="list">
                                {faqsFiltered.map(f => (
                                    <li key={f.id} className="faq-item">
                                        <button
                                            className="faq-q"
                                            onClick={() => toggleFaq(f.id)}
                                            aria-expanded={openFaq === f.id}
                                            aria-controls={`faq-a-${f.id}`}
                                        >
                                            <span>{f.q}</span>
                                            <span className="chev">{openFaq === f.id ? "−" : "+"}</span>
                                        </button>

                                        <div
                                            id={`faq-a-${f.id}`}
                                            className={`faq-a ${openFaq === f.id ? "open" : ""}`}
                                            aria-hidden={openFaq !== f.id}
                                        >
                                            {f.a}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <aside className="aside-col">
                        <div className="panel">
                            <h4 className="panel-title">Your Recent Tickets</h4>
                            <ul className="tickets-list">
                                {USER_TICKETS.map(t => (
                                    <li key={t.id} className="ticket-row">
                                        <div>
                                            <div className="ticket-sub">{t.subject}</div>
                                            <div className="ticket-meta">{t.id} • updated {t.updatedAt}</div>
                                        </div>
                                        <div className={`ticket-status ${t.status.toLowerCase()}`}>{t.status}</div>
                                    </li>
                                ))}
                            </ul>

                            <div className="panel-footer">
                                <Link to="/support/tickets" className="link-muted">View all tickets</Link>
                            </div>
                        </div>

                        <div className="panel">
                            <h4 className="panel-title">Need immediate help?</h4>
                            <p className="muted">If the issue is urgent, set priority to <strong>High</strong> when creating a ticket.</p>
                            <p className="muted">You can also email: <a href="mailto:23020136@vnu.edu.vn">23020136@vnu.edu.vn</a></p>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
}
