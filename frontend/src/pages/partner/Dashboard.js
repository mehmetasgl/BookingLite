// src/pages/partner/Dashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Hotel as HotelIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import hotelService from '../../services/hotelService';

function Dashboard() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await hotelService.getMyHotels();
      console.log('My hotels response:', response.data);

      const hotelsData = response.data?.data || response.data || [];

      if (Array.isArray(hotelsData)) {
        setHotels(hotelsData);
      } else {
        console.error('Hotels data is not an array:', hotelsData);
        setHotels([]);
      }

    } catch (error) {
      console.error('Oteller yüklenemedi:', error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Yayında';
      case 'DRAFT':
        return 'Taslak';
      case 'SUSPENDED':
        return 'Askıda';
      default:
        return status;
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            📊 Partner Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/partner/hotels/new')}
          >
            Yeni Otel Ekle
          </Button>
        </Box>

        {/* İstatistikler */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HotelIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle2">Toplam Otel</Typography>
                </Box>
                <Typography variant="h3">{hotels.length}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="subtitle2">Aktif Rezervasyonlar</Typography>
                </Box>
                <Typography variant="h3">-</Typography>
                <Typography variant="caption" color="text.secondary">
                  Yakında aktif olacak
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MoneyIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="subtitle2">Toplam Gelir</Typography>
                </Box>
                <Typography variant="h3">-</Typography>
                <Typography variant="caption" color="text.secondary">
                  Yakında aktif olacak
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Son Eklenen Oteller */}
        <Typography variant="h5" gutterBottom>
          Son Eklenen Oteller
        </Typography>

        {hotels.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center">
                Henüz otel eklememişsiniz.
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/partner/hotels/new')}
                >
                  İlk Otelimi Ekle
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {hotels.slice(0, 4).map((hotel) => (
              <Grid item xs={12} md={6} key={hotel.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">{hotel.name}</Typography>
                      <Chip
                        label={getStatusText(hotel.status)}
                        color={getStatusColor(hotel.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      📍 {hotel.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🏙️ {hotel.city}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {hotels.length > 4 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button onClick={() => navigate('/partner/hotels')}>
              Tüm Otelleri Gör ({hotels.length})
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}

export default Dashboard;