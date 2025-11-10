import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="col">
          <div className="logo-footer">YourAirline</div>
          <p className="muted">Bay khắp mọi miền, phục vụ tận tâm.</p>
        </div>

        <div className="col">
          <h4>Hỗ trợ</h4>
          <ul>
            <li>Liên hệ</li>
            <li>Góp ý</li>
            <li>Hướng dẫn đặt vé</li>
          </ul>
        </div>

        <div className="col">
          <h4>Chính sách</h4>
          <ul>
            <li>Điều khoản</li>
            <li>Chính sách bảo mật</li>
            <li>Hoàn vé</li>
          </ul>
        </div>

        <div className="col">
          <h4>Kết nối</h4>
          <div className="socials">
            <span className="social">FB</span>
            <span className="social">IG</span>
            <span className="social">YT</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} YourAirline. All rights reserved.
      </div>
    </footer>
  );
}
