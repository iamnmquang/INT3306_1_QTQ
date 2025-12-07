import React from 'react';
import SearchForm from './SearchForm';

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        {/* Nếu bạn có ảnh: đặt ở public/images/banner.jpg */}
        <img src="/images/banner.jpg" alt="banner" className="hero-image" />
        <div className="hero-overlay" />
      </div>

      <div className="container hero-content">
        <div className="hero-text">
          <h1>Bay cùng trải nghiệm mới</h1>
          <p>Đặt vé nhanh chóng — Trải nghiệm thoải mái — Hành trình ý nghĩa</p>
        </div>

        <div className="hero-form-wrapper">
          <SearchForm />
        </div>
      </div>
    </section>
  );
}
