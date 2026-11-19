import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import PassengerPortal from './pages/PassengerPortal';
import DriverPortal from './pages/DriverPortal';
import AdminPortal from './pages/AdminPortal';
import PublicTerminalBoard from './pages/PublicTerminalBoard';

function Layout() {
  const location = useLocation();
  const isBoardView = location.pathname.startsWith('/board');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FB]">
      {!isBoardView && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/passenger" element={<PassengerPortal />} />
          <Route path="/driver" element={<DriverPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/board/:terminalCode?" element={<PublicTerminalBoard />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}
