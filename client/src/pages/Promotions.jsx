import React from "react";
import "./Promotions.css";

const promotions = [
    {
        id: 1,
        title: "Giảm 30% vé nội địa",
        desc: "Áp dụng cho các chuyến bay từ Hà Nội, TP.HCM đến Đà Nẵng, Nha Trang và Phú Quốc.",
        code: "VN30SALE",
        image: "/images/promo1.jpg",
        expiry: "30/11/2025",
    },
    {
        id: 2,
        title: "Ưu đãi mùa lễ hội – giảm 20%",
        desc: "Đặt vé quốc tế đến Singapore, Thái Lan, Malaysia với giá ưu đãi.",
        code: "FESTIVE20",
        image: "/images/promo2.jpg",
        expiry: "15/12/2025",
    },
    {
        id: 3,
        title: "Thành viên Vàng – giảm thêm 10%",
        desc: "Dành cho hội viên hạng Gold của YourAirline. Giảm thêm 10% trên tổng giá trị vé.",
        code: "GOLD10",
        image: "/images/promo3.jpg",
        expiry: "31/12/2025",
    },
];

export default function Promotions() {
    return (
        <div className="promotions-page">
            <h1 className="promo-title">🎉 Khuyến Mãi & Ưu Đãi</h1>
            <p className="promo-subtitle">Nhanh tay săn vé giá rẻ – số lượng có hạn!</p>

            <div className="promo-list">
                {promotions.map((p) => (
                    <div key={p.id} className="promo-card">
                        <img
                            src={p.image}
                            alt={p.title}
                            className="promo-image"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/400x200?text=Promotion";
                            }}
                        />
                        <div className="promo-content">
                            <h3>{p.title}</h3>
                            <p>{p.desc}</p>
                            <div className="promo-meta">
                                <span className="promo-code">Mã: <strong>{p.code}</strong></span>
                                <span className="promo-expiry">HSD: {p.expiry}</span>
                            </div>
                            <button className="promo-btn">Đặt vé ngay</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
