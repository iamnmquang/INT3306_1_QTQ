import React, { useState, useEffect } from 'react';
import NewsManager from '../components/admin/NewsManager';
import AircraftManager from '../components/admin/AircraftManager';
import FlightManager from '../components/admin/FlightManager';
import BookingManager from '../components/admin/BookingManager';
import UserManager from '../components/admin/UserManager';
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
];

export default function Admin(){
  const [tab, setTab] = useState('overview');

  const [loadingOverview, setLoadingOverview] = useState(false);
  const [stats, setStats] = useState({ flights: 0, tickets: 0, users: 0, aircraft: 0 });
  const [upcomingFlights, setUpcomingFlights] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const loadOverview = async () => {
      setLoadingOverview(true);
      try {
        const [flights, tickets, users, aircrafts] = await Promise.all([
          flightApi.getAll(),
          ticketApi.getAll(),
          userApi.getAll(),
          aircraftApi.getAll(),
        ]);

        const now = new Date();
        const upcoming = flights
          .filter(f => new Date(f.departureTime) > now)
          .sort((a,b)=> new Date(a.departureTime) - new Date(b.departureTime))
          .slice(0, 10);

        const recentB = tickets
          .slice()
          .sort((a,b)=> new Date(b.bookedAt) - new Date(a.bookedAt))
          .slice(0, 10);

        const recentU = users.slice().reverse().slice(0,10);

        setStats({ flights: flights.length, tickets: tickets.length, users: users.length, aircraft: aircrafts.length });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-10">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="w-56 border-r pr-4">
              <h2 className="text-xl font-semibold mb-4">Admin</h2>
              <nav className="flex flex-col gap-2">
                {menu.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setTab(m.key)}
                    className={`text-left px-3 py-2 rounded-md w-full ${tab===m.key ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>
                    <span className="mr-2">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <main className="flex-1">
              {tab === 'overview' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-lg shadow flex flex-col">
                      <div className="text-sm text-gray-500">Chuyến bay</div>
                      <div className="text-2xl font-bold">{loadingOverview ? '...' : stats.flights}</div>
                      <div className="text-xs text-gray-400 mt-2">Upcoming: {upcomingFlights.length}</div>
                    </div>

                    <div className="p-4 bg-white rounded-lg shadow flex flex-col">
                      <div className="text-sm text-gray-500">Vé đã đặt</div>
                      <div className="text-2xl font-bold">{loadingOverview ? '...' : stats.tickets}</div>
                      <div className="text-xs text-gray-400 mt-2">Recent: {recentBookings.length}</div>
                    </div>

                    <div className="p-4 bg-white rounded-lg shadow flex flex-col">
                      <div className="text-sm text-gray-500">Người dùng</div>
                      <div className="text-2xl font-bold">{loadingOverview ? '...' : stats.users}</div>
                      <div className="text-xs text-gray-400 mt-2">Recent: {recentUsers.length}</div>
                    </div>

                    <div className="p-4 bg-white rounded-lg shadow flex flex-col">
                      <div className="text-sm text-gray-500">Tàu bay</div>
                      <div className="text-2xl font-bold">{loadingOverview ? '...' : stats.aircraft}</div>
                      <div className="text-xs text-gray-400 mt-2">Total models</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Flights */}
                    <section className="bg-white rounded-lg shadow p-4">
                      <h4 className="font-semibold mb-3">Upcoming Flights</h4>
                      {upcomingFlights.length === 0 ? <div className="text-gray-500">No upcoming flights</div> : (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b"><th>Flight</th><th>From → To</th><th>Departure</th><th>Aircraft</th></tr>
                          </thead>
                          <tbody>
                            {upcomingFlights.map(f => (
                              <tr key={f.id} className="border-b">
                                <td className="py-2">{f.flightNumber}</td>
                                <td>{f.departureAirport?.iataCode || f.departureCity || '-'} → {f.arrivalAirport?.iataCode || f.arrivalCity || '-'}</td>
                                <td>{new Date(f.departureTime).toLocaleString()}</td>
                                <td>{f.aircraft?.name || f.aircraftId}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </section>

                    {/* Recent Bookings & Users */}
                    <section className="space-y-4">
                      <div className="bg-white rounded-lg shadow p-4">
                        <h4 className="font-semibold mb-3">Recent Bookings</h4>
                        {recentBookings.length === 0 ? <div className="text-gray-500">No bookings</div> : (
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b"><th>BookingRef</th><th>Flight</th><th>Seat</th><th>When</th></tr>
                            </thead>
                            <tbody>
                              {recentBookings.map(t => (
                                <tr key={t.id} className="border-b">
                                  <td className="py-2">{t.bookingReference}</td>
                                  <td>{t.flight?.flightNumber}</td>
                                  <td>{t.seatNumber || t.flightSeat?.seatNumber}</td>
                                  <td>{new Date(t.bookedAt).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      <div className="bg-white rounded-lg shadow p-4">
                        <h4 className="font-semibold mb-3">Recent Users</h4>
                        {recentUsers.length === 0 ? <div className="text-gray-500">No users</div> : (
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b"><th>Name</th><th>Email</th><th>Role</th></tr>
                            </thead>
                            <tbody>
                              {recentUsers.map(u => (
                                <tr key={u.id} className="border-b">
                                  <td className="py-2">{u.name}</td>
                                  <td>{u.email}</td>
                                  <td>{u.role}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {tab === 'news' && <NewsManager />}
              {tab === 'aircraft' && <AircraftManager />}
              {tab === 'flights' && <FlightManager />}
              {tab === 'bookings' && <BookingManager />}
              {tab === 'users' && <UserManager />}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}