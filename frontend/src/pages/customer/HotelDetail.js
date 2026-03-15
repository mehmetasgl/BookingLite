// src/pages/customer/HotelDetail.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Hotel as HotelIcon,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import ImageGallery from '../../components/common/ImageGallery';
import hotelService from '../../services/hotelService';

function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHotelDetails();
  }, [id]);

  const loadHotelDetails = async () => {
    try {
      const hotelResponse = await hotelService.getHotelById(id);
      console.log('Hotel response:', hotelResponse.data);

      const hotelData = hotelResponse.data?.data || hotelResponse.data;
      setHotel(hotelData);

      const roomTypesResponse = await hotelService.getRoomTypes(id);
      const roomTypesData = roomTypesResponse.data?.data || roomTypesResponse.data || [];

      if (Array.isArray(roomTypesData)) {
        setRoomTypes(roomTypesData);
      } else {
        setRoomTypes([]);
      }

    } catch (err) {
      console.error('Load hotel details error:', err);
      setError('Otel bilgileri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const getHotelImages = () => {
    if (!hotel) return [];

    if (Array.isArray(hotel.images)) return hotel.images;

    if (hotel.imagesJson && typeof hotel.imagesJson === 'string') {
      try {
        const parsed = JSON.parse(hotel.imagesJson);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse imagesJson:', e);
        return [];
      }
    }

    if (Array.isArray(hotel.imagesJson)) return hotel.imagesJson;

    return [];
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

  if (error || !hotel) {
    return (
      <>
        <Navbar />
        <Container>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error || 'Otel bulunamadı!'}
          </Alert>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Geri Dön
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* ✅ ImageGallery Kullanımı */}
        <Box sx={{ mb: 4 }}>
          <ImageGallery
            mainImage={hotel.mainImageUrl}
            images={getHotelImages()}
          />
        </Box>

        {/* Hotel Info Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {hotel.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip icon={<LocationIcon />} label={hotel.city} />
                  <Chip
                    label={hotel.status}
                    color={hotel.status === 'PUBLISHED' ? 'success' : 'default'}
                  />
                </Box>
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              📍 {hotel.address}
            </Typography>

            {hotel.description && (
              <Typography variant="body1" sx={{ mb: 3 }}>
                {hotel.description}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon color="primary" />
                  <Typography variant="body2">
                    Check-in: <strong>{hotel.checkinTime}</strong>
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon color="primary" />
                  <Typography variant="body2">
                    Check-out: <strong>{hotel.checkoutTime}</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Room Types */}
        <Typography variant="h5" gutterBottom>
          Oda Tipleri ({roomTypes.length})
        </Typography>

        {roomTypes.length === 0 ? (
          <Alert severity="info">
            Bu otel için henüz oda tipi eklenmemiş.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {roomTypes.map((roomType) => (
              <Grid item xs={12} md={6} key={roomType.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {roomType.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          👥 {roomType.capacityAdults} Yetişkin
                          {roomType.capacityChildren > 0 && `, ${roomType.capacityChildren} Çocuk`}
                        </Typography>
                      </Box>
                      <HotelIcon color="primary" />
                    </Box>

                    {roomType.description && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {roomType.description}
                      </Typography>
                    )}

                    {roomType.amenities && roomType.amenities.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          Özellikler:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {roomType.amenities.map((amenity, index) => (
                            <Chip key={index} label={amenity} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate(`/reservation/new?hotelId=${hotel.id}&roomTypeId=${roomType.id}`)}
                    >
                      Rezervasyon Yap
                    </Button>
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

export default HotelDetail;