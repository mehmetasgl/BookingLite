// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Customer Pages
import HotelSearch from './pages/customer/HotelSearch';
import HotelDetail from './pages/customer/HotelDetail';
import ReservationForm from './pages/customer/ReservationForm';
import MyReservations from './pages/customer/MyReservations';

// Partner Pages
import PartnerDashboard from './pages/partner/Dashboard';
import MyHotels from './pages/partner/MyHotels';
import AddHotel from './pages/partner/AddHotel';
import RoomTypeManagement from './pages/partner/RoomTypeManagement';
import RateCalendar from './pages/partner/RateCalendar';

// Services
import authService from './services/authService';

import AdminDashboard from './pages/admin/AdminDashboard';
import PendingHotels from './pages/admin/PendingHotels';
import AllHotels from './pages/admin/AllHotels';
import EditHotel from './pages/partner/EditHotel';
import AddRoomType from './pages/partner/AddRoomType';


// Tema oluştur
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route komponenti
function ProtectedRoute({ children, allowedRoles }) {
  const isAuth = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HotelSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hotel/:id"
            element={
              <ProtectedRoute>
                <HotelDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservation/new"
            element={
              <ProtectedRoute>
                <ReservationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />

          {/* Partner routes */}
          <Route
            path="/partner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/hotels"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <MyHotels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/hotels/new"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <AddHotel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/hotels/:hotelId/room-types"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <RoomTypeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/hotels/:hotelId/room-types/:roomTypeId/rates"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <RateCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/hotels/:hotelId/edit"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <EditHotel />
              </ProtectedRoute>
            }
          />
          // App.js - Partner routes'a ekle:
          <Route
            path="/partner/hotels/:hotelId/room-types/new"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <AddRoomType />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/hotels/:hotelId/room-types/:roomTypeId/edit"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <AddRoomType editMode={true} />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hotels/pending"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PendingHotels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hotels"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AllHotels />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;