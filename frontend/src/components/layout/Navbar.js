// src/components/layout/Navbar.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import authService from '../../services/authService';

function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <HotelIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 0, mr: 4, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Booking Lite
          </Typography>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            {/* CUSTOMER Menu */}
            {user.role === 'CUSTOMER' && (
              <>
                <Button color="inherit" onClick={() => navigate('/')}>
                  Otel Ara
                </Button>
                <Button color="inherit" onClick={() => navigate('/my-reservations')}>
                  Rezervasyonlarım
                </Button>
              </>
            )}

            {/* PARTNER Menu */}
            {user.role === 'PARTNER' && (
              <>
                <Button
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/partner/dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/partner/hotels')}
                >
                  Otellerim
                </Button>
              </>
            )}

            {/* ADMIN Menu */}
            {user.role === 'ADMIN' && (
              <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin/hotels/pending')}
                >
                  Onay Bekleyenler
                </Button>
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin/hotels')}
                >
                  Tüm Oteller
                </Button>
              </>
            )}
          </Box>

          {/* User Info & Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="body2">
                {user.email}
              </Typography>
            </Box>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Çıkış
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;