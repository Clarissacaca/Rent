import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Booking from "./pages/Booking";
import Invoice from "./pages/Invoice";
import AdminTransaksi from "./pages/AdminTransaksi";
import RiwayatSewa from "./pages/RiwayatSewa";
import Pengembalian from "./pages/Pengembalian";




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/admin/transaksi" element={<AdminTransaksi />} />
        <Route path="/riwayat" element={<RiwayatSewa />} />
        <Route path="/pengembalian/:id" element={<Pengembalian />} />
      </Routes>
    </BrowserRouter>
  );
}



