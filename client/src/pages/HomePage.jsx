import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/homepage/Header';
import Footer from '../components/homepage/Footer';
import SearchForm from '../components/homepage/SearchForm';

const cards = [
  {
    title: "Ưu đãi mùa thu",
    desc: "Giảm giá đến 30% cho các chuyến bay nội địa và quốc tế.",
    img: "/images/service.jpg",
  },
  {
    title: "Tour trọn gói",
    desc: "Combo vé + khách sạn giúp bạn tiết kiệm thời gian và chi phí.",
    img: "/images/service.jpg",
  },
  {
    title: "Hành lý thêm",
    desc: "Mua thêm hành lý với giá ưu đãi trước khi bay.",
    img: "/images/service.jpg",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ================= HERO ================= */}
      <section id="home" className="relative h-[85vh] w-full">
        {/* Background image */}
        <img
          src="/images/banner.jpg"
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full
                        flex flex-col justify-center gap-10">

          <div className="text-white max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bay cùng trải nghiệm mới
            </h1>
            <p className="text-lg text-gray-200">
              Đặt vé nhanh chóng — Trải nghiệm thoải mái — Hành trình ý nghĩa
            </p>
          </div>

          {/* Search form */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section id="promo" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ưu đãi & Dịch vụ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((c, i) => (
              <article
                key={i}
                className="bg-white rounded-xl shadow hover:shadow-lg
                           transition overflow-hidden"
              >
                <img
                  src={c.img}
                  alt={c.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {c.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {c.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

