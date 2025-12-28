import React, { useMemo, useState } from "react";
import "../styles/Schedule.css";
import { Link } from "react-router-dom";

/* Demo dữ liệu - thay bằng fetch từ API khi cần */
const DEMO_FLIGHTS = [
    { id: "VN123", airline: "Vietnam Airlines", from: "SGN", to: "HAN", depart: "2025-11-12T08:30:00", arrive: "2025-11-12T10:40:00", status: "On time", duration: "2h10m", price: 120, class: "Economy", stops: 0 },
    { id: "VJ201", airline: "VietJet Air", from: "SGN", to: "DAD", depart: "2025-11-12T09:00:00", arrive: "2025-11-12T10:05:00", status: "Delayed", duration: "1h5m", price: 45, class: "Economy", stops: 0 },
    { id: "BL456", airline: "Bamboo Airways", from: "HAN", to: "SGN", depart: "2025-11-12T12:20:00", arrive: "2025-11-12T14:30:00", status: "Cancelled", duration: "2h10m", price: 110, class: "Business", stops: 0 },
    { id: "QR789", airline: "Qatar Airways", from: "SGN", to: "DOH", depart: "2025-11-13T23:00:00", arrive: "2025-11-14T05:40:00", status: "On time", duration: "6h40m", price: 650, class: "Economy", stops: 0 },
    { id: "TK002", airline: "Turkish Airlines", from: "SGN", to: "IST", depart: "2025-11-14T02:30:00", arrive: "2025-11-14T13:50:00", status: "On time", duration: "12h20m", price: 780, class: "Business", stops: 1 },
    // add more demo items...
];

function formatDateTime(iso) {
    const d = new Date(iso);
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = d.toLocaleDateString();
    return { time, date };
}

export default function Schedule() {
    const [q, setQ] = useState(""); // search by from/to/id/airline
    const [date, setDate] = useState(""); // yyyy-mm-dd
    const [airlineFilter, setAirlineFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [classFilter, setClassFilter] = useState("All");
    const [sortBy, setSortBy] = useState("depart"); // depart or price
    const [page, setPage] = useState(1);
    const perPage = 6;

    const airlines = useMemo(() => ["All", ...Array.from(new Set(DEMO_FLIGHTS.map(f => f.airline)))], []);
    const statuses = ["All", "On time", "Delayed", "Cancelled"];
    const classes = ["All", "Economy", "Business", "First"];

    const filtered = useMemo(() => {
        let fl = DEMO_FLIGHTS.filter(f => {
            const ql = q.trim().toLowerCase();
            const matchQ =
                !ql ||
                f.id.toLowerCase().includes(ql) ||
                f.airline.toLowerCase().includes(ql) ||
                f.from.toLowerCase().includes(ql) ||
                f.to.toLowerCase().includes(ql);
            const matchDate = !date || f.depart.startsWith(date);
            const matchAirline = airlineFilter === "All" || f.airline === airlineFilter;
            const matchStatus = statusFilter === "All" || f.status === statusFilter;
            const matchClass = classFilter === "All" || f.class === classFilter;
            return matchQ && matchDate && matchAirline && matchStatus && matchClass;
        });

        fl.sort((a, b) => {
            if (sortBy === "price") return a.price - b.price;
            return new Date(a.depart) - new Date(b.depart);
        });
        return fl;
    }, [q, date, airlineFilter, statusFilter, classFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

    function gotoPage(p) {
        setPage(Math.max(1, Math.min(totalPages, p)));
    }

    return (
        <div className="schedule-page">
            <div className="schedule-card">
                <header className="schedule-header">
                    <div>
                        <h1 className="schedule-title">Lịch bay</h1>
                        <p className="schedule-sub">Tìm chuyến theo điểm đi/đến, ngày và hãng</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/" className="btn-muted">Trở về</Link>
                        <Link to="/book" className="btn-primary">Book a flight</Link>
                    </div>
                </header>

                <section className="schedule-filters">
                    <input
                        className="search"
                        placeholder="Tìm mã chuyến, hãng, SGN, HAN..."
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setPage(1); }}
                    />

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); setPage(1); }}
                    />

                    <select value={airlineFilter} onChange={(e) => { setAirlineFilter(e.target.value); setPage(1); }}>
                        {airlines.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}>
                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="depart">Sort by depart time</option>
                        <option value="price">Sort by price</option>
                    </select>
                </section>

                <main className="schedule-main">
                    <div className="flights-list">
                        {pageItems.length === 0 ? (
                            <div className="empty">Không tìm thấy chuyến nào.</div>
                        ) : (
                            pageItems.map(f => {
                                const depart = formatDateTime(f.depart);
                                const arrive = formatDateTime(f.arrive);
                                return (
                                    <article key={f.id + f.depart} className="flight-row">
                                        <div className="flight-left">
                                            <div className="flight-id">{f.id} <span className="airline">{f.airline}</span></div>
                                            <div className="route">
                                                <div className="station">
                                                    <div className="code">{f.from}</div>
                                                    <div className="time">{depart.time}</div>
                                                    <div className="date">{depart.date}</div>
                                                </div>
                                                <div className="arrow">→</div>
                                                <div className="station">
                                                    <div className="code">{f.to}</div>
                                                    <div className="time">{arrive.time}</div>
                                                    <div className="date">{arrive.date}</div>
                                                </div>
                                            </div>
                                            <div className="meta">{f.duration} • {f.stops === 0 ? "Direct" : `${f.stops} stops`} • Class: {f.class}</div>
                                        </div>

                                        <div className="flight-right">
                                            <div className={`status ${f.status.toLowerCase().replace(/\s+/g, "-")}`}>{f.status}</div>
                                            <div className="price">${f.price}</div>
                                            <div className="actions">
                                                <Link to={`/book?flight=${encodeURIComponent(f.id)}`} className="btn-primary small">Chọn</Link>
                                                <button className="btn-ghost">Details</button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>

                    <footer className="schedule-footer">
                        <div className="pagination">
                            <button onClick={() => gotoPage(page - 1)} disabled={page === 1}>Prev</button>
                            <span>Page {page} / {totalPages}</span>
                            <button onClick={() => gotoPage(page + 1)} disabled={page === totalPages}>Next</button>
                        </div>
                        <div className="result-count">{filtered.length} results</div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
