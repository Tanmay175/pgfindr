import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import PGDetails from "./pages/PGDetails";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";

import StudentDashboard from "./pages/StudentDashboard";
import MyBookings from "./pages/MyBookings";

import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerPGs from "./pages/OwnerPGs";
import AddPG from "./pages/AddPG";
import BookingRequests from "./pages/BookingRequests";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/pgs/:id" element={<PGDetails />} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/favorites" element={<ProtectedRoute role="student"><Favorites /></ProtectedRoute>} />
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/bookings" element={<ProtectedRoute role="student"><MyBookings /></ProtectedRoute>} />

        <Route path="/owner/dashboard" element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/pgs" element={<ProtectedRoute role="owner"><OwnerPGs /></ProtectedRoute>} />
        <Route path="/owner/pgs/new" element={<ProtectedRoute role="owner"><AddPG /></ProtectedRoute>} />
        <Route path="/owner/bookings" element={<ProtectedRoute role="owner"><BookingRequests /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}
