// src/pages/admin/PendingHotels.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

function PendingHotels() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState({ open: false, hotel: null, action: '' });

  useEffect(() => {
    loadPendingHotels();
  }, []);

  const loadPendingHotels = async () => {
    try {
      const response = await api.get('/admin/hotels/pending');
      setHotels(response.data.data || []);
    } catch (err) {
      setError('Oteller yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hotelId) => {
    try {
      await api.post(`/admin/hotels/${hotelId}/approve`);
      setDialog({ open: false, hotel: null, action: '' });
      loadPendingHotels();
    } catch (err) {
      alert('Otel onaylanamadı!');
    }
  };

  const handleSuspend = async (hotelId) => {
    try {
      await api.post(`/admin/hotels/${hotelId}/suspend`);
      setDialog({ open: false, hotel: null, action: '' });
      loadPendingHotels();
    } catch (err) {
      alert('Otel reddedilemedi!');
    }
  };

  const getImageUrl = (hotel) => {
    if (hotel?.mainImageUrl) {
      if (hotel.mainImageUrl.startsWith('http')) {
        return hotel.mainImageUrl;
      }
      return 'http://localhost:8080' + hotel.mainImageUrl;
    }
    return 'https://via.placeholder.com/400x200?text=No+Image';
  };

  const getGalleryCount = (hotel) => {
    if (!hotel?.imagesJson) return 0;
    try {
      const images = typeof hotel.imagesJson === 'string'
        ? JSON.parse(hotel.imagesJson)
        : hotel.imagesJson;
      return Array.isArray(images) ? images.length : 0;
    } catch {
      return 0;
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
          ⏳ Onay Bekleyen Oteller ({hotels.length})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {hotels.length === 0 ? (
          <Alert severity="info">
            Onay bekleyen otel yok! 🎉
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {hotels.map((hotel) => (
              <Grid item xs={12} md={6} key={hotel.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/*  Otel Fotoğrafı */}
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={getImageUrl(hotel)}
                      alt={hotel.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    {/* Fotoğraf sayısı badge */}
                    {getGalleryCount(hotel) > 0 && (
                      <Chip
                        label={`+${getGalleryCount(hotel)} fotoğraf`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                        }}
                      />
                    )}
                    {/* Status badge */}
                    <Chip
                      label="DRAFT"
                      color="warning"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {hotel.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      📍 {hotel.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🏙️ {hotel.city}
                    </Typography>

                    {hotel.description && (
                      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        {hotel.description.substring(0, 120)}
                        {hotel.description.length > 120 && '...'}
                      </Typography>
                    )}

                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        🕐 Check-in: {hotel.checkinTime}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        🕐 Check-out: {hotel.checkoutTime}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      👤 Partner ID: {hotel.partnerUserId}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                    >
                      Detay
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<ApproveIcon />}
                        onClick={() => setDialog({ open: true, hotel, action: 'approve' })}
                      >
                        Onayla
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<RejectIcon />}
                        onClick={() => setDialog({ open: true, hotel, action: 'reject' })}
                      >
                        Reddet
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, hotel: null, action: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialog.action === 'approve' ? '✅ Otel Onayla' : '❌ Otel Reddet'}
        </DialogTitle>
        <DialogContent>
          {/* Dialog içinde de fotoğraf göster */}
          {dialog.hotel && (
            <Box sx={{ mb: 2 }}>
              <img
                src={getImageUrl(dialog.hotel)}
                alt={dialog.hotel.name}
                style={{
                  width: '100%',
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </Box>
          )}
          <Typography>
            {dialog.action === 'approve'
              ? `"${dialog.hotel?.name}" otelini onaylamak istediğinizden emin misiniz? Otel yayınlanacak ve müşteriler görebilecek.`
              : `"${dialog.hotel?.name}" otelini reddetmek istediğinizden emin misiniz? Otel askıya alınacak.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, hotel: null, action: '' })}>
            İptal
          </Button>
          <Button
            onClick={() =>
              dialog.action === 'approve'
                ? handleApprove(dialog.hotel?.id)
                : handleSuspend(dialog.hotel?.id)
            }
            color={dialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {dialog.action === 'approve' ? 'Onayla' : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PendingHotels;