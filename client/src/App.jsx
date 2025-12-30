import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import VerifyRegisterEmail from './pages/VerifyRegisterEmail';
import Login from './pages/Login';

// Pages
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/common/ProtectedRoute';
import Profile from './pages/Profile';
import SelectFlight from './pages/SelectFlight';
import Book from './pages/Book';
import BookingSuccess from './pages/BookingSuccess';
import MyFlights from './pages/MyFlights';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-register-email" element={<VerifyRegisterEmail />} />

          {/* Protected */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/select-flight" element={<SelectFlight />} />
          <Route path="/book" element={<Book />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/my-flights" element={<MyFlights />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;