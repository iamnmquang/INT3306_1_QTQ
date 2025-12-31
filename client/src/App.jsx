import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Register from './pages/Register';
import VerifyRegisterEmail from './pages/VerifyRegisterEmail';
import Login from './pages/Login';
import Header from './components/homepage/Header';

// Pages
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import Profile from './pages/Profile';
import SelectFlight from './pages/SelectFlight';
import Book from './pages/Book';
import BookingSuccess from './pages/BookingSuccess';
import MyFlights from './pages/MyFlights';
import SupportChat from './pages/SupportChat';
import BookingSearch from './pages/BookingSearch';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

// Admin
import Admin from './pages/Admin';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Header />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/verify-register-email"
              element={<VerifyRegisterEmail />}
            />

            {/* Protected */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="/select-flight" element={<SelectFlight />} />
            <Route path="/book" element={<Book />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route
              path="/my-flights"
              element={
                <ProtectedRoute>
                  <MyFlights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support-chat"
              element={
                <ProtectedRoute>
                  <SupportChat />
                </ProtectedRoute>
              }
            />

            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/booking-search" element={<BookingSearch />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
