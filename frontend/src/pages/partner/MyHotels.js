// src/pages/partner/MyHotels.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  CardActionArea,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Bed as BedIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import hotelService from '../../services/hotelService';

function MyHotels() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getMyHotels();
      const data = response.data?.data || response.data || [];
      setHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Oteller yüklenemedi:', error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm('Bu oteli silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await hotelService.deleteHotel(id);
      alert('Otel silindi');
      fetchHotels();
    } catch (error) {
      alert('Otel silinemedi');
    }
  };

  const getImageUrl = (hotel) => {
    if (hotel.mainImageUrl) {
      if (hotel.mainImageUrl.startsWith('http')) {
        return hotel.mainImageUrl;
      }
      return 'http://localhost:8080' + hotel.mainImageUrl;
    }
    return 'https://via.placeholder.com/400x200?text=No+Image';
  };

  const getStatusColor = (status) => {
    const colors = {
      'PUBLISHED': 'success',
      'PENDING': 'warning',
      'DRAFT': 'default',
    };
    return colors[status] || 'default';
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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            🏨 Otellerim ({hotels.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/partner/hotels/new')}
            size="large"
          >
            Yeni Otel Ekle
          </Button>
        </Box>

        {/* Empty State */}
        {hotels.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              Henüz Otel Eklemediniz
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Hemen ilk otelinizi ekleyerek misafir kabul etmeye başlayın!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/partner/hotels/new')}
            >
              İlk Otelimi Ekle
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {hotels.map((hotel) => (
              <Grid item xs={12} md={6} lg={4} key={hotel.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  {/* ✅ Tıklanabilir Alan - Fotoğraf ve Bilgiler */}
                  <CardActionArea onClick={() => navigate(`/hotel/${hotel.id}`)}>
                    {/* Image */}
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getImageUrl(hotel)}
                        alt={hotel.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      {/* Status Badge */}
                      <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                        <Chip
                          label={hotel.status}
                          color={getStatusColor(hotel.status)}
                          size="small"
                        />
                      </Box>
                      {/* View Hint */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          py: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '.MuiCardActionArea-root:hover &': {
                            opacity: 1,
                          },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                        <Typography variant="caption">Detayları Gör</Typography>
                      </Box>
                    </Box>

                    <CardContent>
                      {/* Hotel Name */}
                      <Typography variant="h6" gutterBottom>
                        {hotel.name}
                      </Typography>

                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {hotel.city}
                        </Typography>
                      </Box>

                      {/* Address */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                        noWrap
                      >
                        {hotel.address}
                      </Typography>

                      {/* Check-in/out Times */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label={`Check-in: ${hotel.checkinTime}`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`Check-out: ${hotel.checkoutTime}`}
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>

                  {/* Butonlar - Tıklanabilir alanın dışında */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<BedIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/partner/hotels/${hotel.id}/room-types`);
                      }}
                    >
                      Oda Tipleri
                    </Button>
                  </CardActions>

                  <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/partner/hotels/${hotel.id}/edit`);
                      }}
                    >
                      Düzenle
                    </Button>
                    <IconButton
                      color="error"
                      onClick={(e) => handleDelete(hotel.id, e)}
                      sx={{
                        border: '1px solid',
                        borderColor: 'error.main',
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

export default MyHotels;