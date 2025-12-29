import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Footer from './components/Footer';

import Login from "./pages/Login";
import Register from "./pages/Register";

import CreateTicket from "./pages/CreateTicket";
import Support from "./pages/Support";
import TicketsList from "./pages/TicketsList";
import TicketDetail from "./pages/TicketDetail";
import Schedule from './pages/Schedule';
import Promotions from './pages/Promotions';
import VerifyOtp from './pages/VerifyOtp';
import Profile from './pages/Profile';
import SupportChat from './pages/SupportChat';

import "./index.css";

function App() {

  // ✅ Chờ xác định user

  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <main>
                <Hero />
                <Services />
              </main>
              <Footer />
            </>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/support" element={<Support />} />
        <Route path="/support/new" element={<CreateTicket />} />
        <Route path="/support/tickets" element={<TicketsList />} />
        <Route path="/support/tickets/:id" element={<TicketDetail />} />

        <Route path="/schedule" element={<Schedule />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/verify-register-email" element={<VerifyOtp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/support-chat" element={<SupportChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
