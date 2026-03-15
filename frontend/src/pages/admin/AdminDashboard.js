// src/pages/admin/AdminDashboard.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Sistem istatistikleri ve yönetim
        </Typography>

        {/* Otel İstatistikleri */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            🏨 Otel İstatistikleri
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HotelIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2">Toplam Otel</Typography>
                  </Box>
                  <Typography variant="h3">{stats?.totalHotels || 0}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="subtitle2">Yayında</Typography>
                  </Box>
                  <Typography variant="h3" color="success.main">
                    {stats?.publishedHotels || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="subtitle2">Beklemede</Typography>
                  </Box>
                  <Typography variant="h3" color="warning.main">
                    {stats?.draftHotels || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BlockIcon sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="subtitle2">Askıda</Typography>
                  </Box>
                  <Typography variant="h3" color="error.main">
                    {stats?.suspendedHotels || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Kullanıcı İstatistikleri */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            👥 Kullanıcı İstatistikleri
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle2">Toplam Kullanıcı</Typography>
                  </Box>
                  <Typography variant="h3">{stats?.totalUsers || 0}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Typography variant="subtitle2">Müşteriler</Typography>
                  </Box>
                  <Typography variant="h3" color="info.main">
                    {stats?.customerCount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="subtitle2">Partner'lar</Typography>
                  </Box>
                  <Typography variant="h3" color="secondary.main">
                    {stats?.partnerCount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}

export default AdminDashboard;
