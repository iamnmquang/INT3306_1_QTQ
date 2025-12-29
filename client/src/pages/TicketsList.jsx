import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "../styles/TicketsList.css";

/* Demo data (thay bằng fetch từ API khi cần) */
const DEMO_TICKETS = [
    { id: "TKT-100001", subject: "Thanh toán failed", status: "Open", updatedAt: "2025-10-28", createdAt: "2025-10-27" },
    { id: "TKT-100002", subject: "Yêu cầu hoàn tiền", status: "Pending", updatedAt: "2025-10-24", createdAt: "2025-10-23" },
    { id: "TKT-100003", subject: "Lỗi đăng nhập", status: "Resolved", updatedAt: "2025-09-30", createdAt: "2025-09-29" },
    { id: "TKT-100004", subject: "Vé chưa gửi email", status: "Closed", updatedAt: "2025-08-10", createdAt: "2025-08-09" },
    { id: "TKT-100005", subject: "Lỗi thanh toán 3D Secure", status: "Open", updatedAt: "2025-11-01", createdAt: "2025-10-31" },
];

const STATUS_OPTIONS = ["All", "Open", "Pending", "Resolved", "Closed"];

export default function TicketsList() {
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("All");
    const [sortDir, setSortDir] = useState("desc"); // desc or asc
    const [page, setPage] = useState(1);
    const perPage = 6;

    const filtered = useMemo(() => {
        const s = DEMO_TICKETS.filter(t => {
            if (status !== "All" && t.status !== status) return false;
            if (!q) return true;
            const ql = q.toLowerCase();
            return t.id.toLowerCase().includes(ql) || t.subject.toLowerCase().includes(ql);
        });
        return s.sort((a, b) => {
            const da = new Date(a.updatedAt), db = new Date(b.updatedAt);
            return sortDir === "desc" ? db - da : da - db;
        });
    }, [q, status, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

    function gotoPage(p) {
        setPage(Math.max(1, Math.min(totalPages, p)));
    }

    return (
        <div className="tickets-page">
            <div className="tickets-card">
                <header className="tickets-header">
                    <div>
                        <h2 className="tickets-title">Your Tickets</h2>
                        <p className="muted">Quản lý và theo dõi trạng thái các yêu cầu hỗ trợ của bạn.</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/support/new" className="btn-primary small">Create Ticket</Link>
                    </div>
                </header>

                <div className="tickets-controls">
                    <input
                        className="tickets-search"
                        placeholder="Search by id or subject..."
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    />

                    <div className="tickets-filters">
                        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <button className="small ghost" onClick={() => setSortDir(dir => dir === "desc" ? "asc" : "desc")}>
                            Sort: {sortDir === "desc" ? "Newest" : "Oldest"}
                        </button>
                    </div>
                </div>

                <div className="tickets-table">
                    {pageItems.length === 0 ? (
                        <div className="empty">Không có ticket nào khớp kết quả.</div>
                    ) : (
                        pageItems.map(t => (
                            <div key={t.id} className="ticket-row">
                                <div className="ticket-left">
                                    <div className="ticket-id">{t.id}</div>
                                    <div className="ticket-sub">{t.subject}</div>
                                    <div className="ticket-meta">Created: {t.createdAt} • Updated: {t.updatedAt}</div>
                                </div>

                                <div className="ticket-right">
                                    <div className={`ticket-status ${t.status.toLowerCase()}`}>{t.status}</div>
                                    <Link to={`/support/tickets/${t.id}`} className="btn-view">View</Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="tickets-footer">
                    <div className="pagination">
                        <button onClick={() => gotoPage(page - 1)} disabled={page === 1}>Prev</button>
                        <span>Page {page} / {totalPages}</span>
                        <button onClick={() => gotoPage(page + 1)} disabled={page === totalPages}>Next</button>
                    </div>

                    <div>
                        <Link to="/support" className="link-muted">Back to Help Center</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
