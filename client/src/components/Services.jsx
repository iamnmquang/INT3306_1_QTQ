import React from 'react';

const cards = [
  {
    title: 'Ưu đãi mùa thu',
    desc: 'Giảm giá đến 30% cho các chuyến bay nội địa và quốc tế.',
    img: '/images/service.jpg'
  },
  {
    title: 'Tour trọn gói',
    desc: 'Combo vé + khách sạn giúp bạn tiết kiệm thời gian và chi phí.',
    img: '/images/service.jpg'
  },
  {
    title: 'Hành lý thêm',
    desc: 'Mua thêm hành lý với giá ưu đãi trước khi bay.',
    img: '/images/service.jpg'
  }
];

export default function Services() {
  return (
    <section className="services container" id="promo">
      <h2 className="section-title">Ưu đãi & Dịch vụ</h2>
      <div className="cards">
        {cards.map((c, i) => (
          <article className="card" key={i}>
            <div className="card-image">
              <img src={c.img} alt={c.title} />
            </div>
            <div className="card-body">
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
