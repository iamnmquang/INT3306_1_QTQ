import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Logo & slogan */}
        <div>
          <div className="text-2xl font-bold text-white mb-3">
            YourAirline
          </div>
          <p className="text-sm text-gray-400">
            Bay khắp mọi miền, phục vụ tận tâm.
          </p>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Liên hệ</li>
            <li className="hover:text-white cursor-pointer">Góp ý</li>
            <li className="hover:text-white cursor-pointer">
              Hướng dẫn đặt vé
            </li>
          </ul>
        </div>

        {/* Policy */}
        <div>
          <h4 className="text-white font-semibold mb-4">Chính sách</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Điều khoản</li>
            <li className="hover:text-white cursor-pointer">
              Chính sách bảo mật
            </li>
            <li className="hover:text-white cursor-pointer">Hoàn vé</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-white font-semibold mb-4">Kết nối</h4>
          <div className="flex gap-3">
            <span className="w-9 h-9 flex items-center justify-center
           rounded-full border border-gray-600
           hover:bg-white hover:text-gray-900
           transition cursor-pointer text-sm font-medium;">FB</span>
            <span className="w-9 h-9 flex items-center justify-center
           rounded-full border border-gray-600
           hover:bg-white hover:text-gray-900
           transition cursor-pointer text-sm font-medium;">IG</span>
            <span className="w-9 h-9 flex items-center justify-center
           rounded-full border border-gray-600
           hover:bg-white hover:text-gray-900
           transition cursor-pointer text-sm font-medium;">YT</span>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} YourAirline. All rights reserved.
      </div>
    </footer>
  );
}
