import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Footer from './components/Footer';

import Login from "./pages/Login";   // ✅ import trang Login
import Register from "./pages/Register"; // ✅ import trang Register

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        { }
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

        { }
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
