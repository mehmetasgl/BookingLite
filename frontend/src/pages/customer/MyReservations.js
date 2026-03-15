// src/pages/customer/MyReservations.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  EventNote as DateIcon,
  People as GuestsIcon,
  AttachMoney as PriceIcon,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import reservationService from '../../services/reservationService';

function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getMyReservations();

      console.log('📋 Reservations Response:', response.data);

      const data = response.data?.data || response.data || [];
      const reservationsArray = Array.isArray(data) ? data : [];

      console.log('📋 Reservations Array:', reservationsArray);

      setReservations(reservationsArray);
    } catch (error) {
      console.error('❌ Rezervasyonlar yüklenemedi:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await reservationService.cancelReservation(id);
      alert('Rezervasyon iptal edildi');
      fetchReservations();
    } catch (error) {
      alert('İptal işlemi başarısız: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRMED': 'success',
      'CANCELLED': 'error',
      'PENDING': 'warning',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'CONFIRMED': 'Onaylandı',
      'CANCELLED': 'İptal Edildi',
      'PENDING': 'Beklemede',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          📋 Rezervasyonlarım
        </Typography>

        {/* Empty State */}
        {reservations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              Henüz Rezervasyonunuz Yok
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Harika otelleri keşfedin ve ilk rezervasyonunuzu yapın!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              size="large"
            >
              Otelleri Keşfet
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {reservations.map((reservation) => (
              <Grid item xs={12} md={6} key={reservation.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        Rezervasyon #{reservation.id}
                      </Typography>
                      <Chip
                        label={getStatusLabel(reservation.status)}
                        color={getStatusColor(reservation.status)}
                        size="small"
                      />
                    </Box>

                    {/* Hotel Name */}
                    {reservation.hotelName && (
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        🏨 {reservation.hotelName}
                      </Typography>
                    )}

                    {/* Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {reservation.checkin} → {reservation.checkout}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GuestsIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {reservation.guestsAdults} Yetişkin
                          {reservation.guestsChildren > 0 && `, ${reservation.guestsChildren} Çocuk`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriceIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${reservation.totalPrice}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Notes */}
                    {reservation.guestNotes && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Not: {reservation.guestNotes}
                      </Typography>
                    )}

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(`/hotel/${reservation.hotelId}`)}
                      >
                        Oteli Gör
                      </Button>
                      {reservation.status === 'CONFIRMED' && (
                        <Button
                          fullWidth
                          variant="contained"
                          color="error"
                          onClick={() => handleCancel(reservation.id)}
                        >
                          İptal Et
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

export default MyReservations;