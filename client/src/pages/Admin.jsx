import React, { useState, useEffect } from 'react';
import NewsManager from '../components/admin/NewsManager';
import AircraftManager from '../components/admin/AircraftManager';
import FlightManager from '../components/admin/FlightManager';
import BookingManager from '../components/admin/BookingManager';
import UserManager from '../components/admin/UserManager';
import SupportManager from '../components/admin/SupportManager';

import { flightApi } from '../api/flightApi';
import { ticketApi } from '../api/ticketApi';
import { userApi } from '../api/userApi';
import { aircraftApi } from '../api/aircraftApi';

const menu = [
  { key: 'overview', label: 'Tổng quan', emoji: '📊' },
  { key: 'news', label: 'Tin tức', emoji: '📰' },
  { key: 'aircraft', label: 'Tàu bay', emoji: '✈️' },
  { key: 'flights', label: 'Chuyến bay', emoji: '🕒' },
  { key: 'bookings', label: 'Đặt vé', emoji: '🎫' },
  { key: 'users', label: 'Người dùng', emoji: '👥' },
  { key: 'chat', label: 'Hỗ trợ', emoji: '💬' }
];

export default function Admin() {
  const [tab, setTab] = useState('overview');

  const [loadingOverview, setLoadingOverview] = useState(false);
  const [stats, setStats] = useState({
    flights: 0,
    tickets: 0,
    users: 0,
    aircraft: 0
  });

  const [upcomingFlights, setUpcomingFlights] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  /* ======================
      Load overview
  ====================== */
  useEffect(() => {
    const loadOverview = async () => {
      setLoadingOverview(true);
      try {
        const [flights, tickets, users, aircrafts] = await Promise.all([
          flightApi.getAll(),
          ticketApi.getAll(),
          userApi.getAll(),
          aircraftApi.getAll()
        ]);

        const now = new Date();

        const upcoming = flights
          .filter(f => new Date(f.departureTime) > now)
          .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))
          .slice(0, 10);

        const recentB = tickets
          .slice()
          .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
          .slice(0, 10);

        const recentU = users.slice().reverse().slice(0, 10);

        setStats({
          flights: flights.length,
          tickets: tickets.length,
          users: users.length,
          aircraft: aircrafts.length
        });

        setUpcomingFlights(upcoming);
        setRecentBookings(recentB);
        setRecentUsers(recentU);
      } catch (err) {
        console.error('Overview load error', err);
        alert('Lỗi tải dữ liệu tổng quan');
      } finally {
        setLoadingOverview(false);
      }
    };

    loadOverview();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Admin Panel
            </h2>
            <nav className="flex flex-col gap-1">
              {menu.map(m => (
                <button
                  key={m.key}
                  onClick={() => setTab(m.key)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
                  ${tab === m.key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1">
            {/* Overview */}
            {tab === 'overview' && (
              <div className="space-y-8">
                {/* Header */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
                    Tổng quan quản trị
                  </h1>
                  <p className="text-slate-600">
                    Thống kê nhanh hệ thống
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-sm text-slate-500 mb-1">Chuyến bay</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loadingOverview ? '...' : stats.flights}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Sắp tới: {upcomingFlights.length}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-sm text-slate-500 mb-1">Vé đã đặt</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loadingOverview ? '...' : stats.tickets}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Gần đây: {recentBookings.length}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-sm text-slate-500 mb-1">Người dùng</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loadingOverview ? '...' : stats.users}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Mới: {recentUsers.length}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="text-sm text-slate-500 mb-1">Tàu bay</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {loadingOverview ? '...' : stats.aircraft}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            {tab === 'news' && <NewsManager />}
            {tab === 'aircraft' && <AircraftManager />}
            {tab === 'flights' && <FlightManager />}
            {tab === 'bookings' && <BookingManager />}
            {tab === 'users' && <UserManager />}
            {tab === 'chat' && <SupportManager />}
          </main>
        </div>
      </div>
    </div>
  );

}
