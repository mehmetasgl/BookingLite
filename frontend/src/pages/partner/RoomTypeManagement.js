// src/pages/partner/RoomTypeManagement.js - DÜZELTILMIŞ
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import hotelService from '../../services/hotelService';

function RoomTypeManagement() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const hotelResponse = await hotelService.getHotelById(hotelId);
      const hotelData = hotelResponse.data?.data || hotelResponse.data;
      setHotel(hotelData);

      const roomTypesResponse = await hotelService.getRoomTypes(hotelId);
      const roomTypesData = roomTypesResponse.data?.data || roomTypesResponse.data || [];

      setRoomTypes(Array.isArray(roomTypesData) ? roomTypesData : []);

    } catch (error) {
      console.error('Veriler yüklenemedi:', error);
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomTypeId) => {
    if (!window.confirm('Bu oda tipini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await hotelService.deleteRoomType(hotelId, roomTypeId);
      alert('Oda tipi silindi');
      fetchData();
    } catch (error) {
      alert('Oda tipi silinemedi');
    }
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            🛏️ Oda Tipleri
          </Typography>
          {hotel && (
            <Typography variant="body1" color="text.secondary">
              {hotel.name}
            </Typography>
          )}
        </Box>

        {/* Add Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/partner/hotels/${hotelId}/room-types/new`)}
            size="large"
          >
            Yeni Oda Tipi Ekle
          </Button>
        </Box>

        {/* Room Types List */}
        {roomTypes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              Henüz Oda Tipi Eklemediniz
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Misafirleriniz için farklı oda seçenekleri oluşturun.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/partner/hotels/${hotelId}/room-types/new`)}
            >
              İlk Oda Tipini Ekle
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {roomTypes.map((roomType) => (
              <Grid item xs={12} md={6} key={roomType.id}>
                <Card
                  sx={{
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
                        {roomType.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/partner/hotels/${hotelId}/room-types/${roomType.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(roomType.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {roomType.description || 'Açıklama yok'}
                    </Typography>

                    {/* Details */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip
                        size="small"
                        label={`Kapasite: ${roomType.capacity || 0} kişi`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={roomType.bedType || 'Standart'}
                        variant="outlined"
                      />
                      {roomType.size && (
                        <Chip
                          size="small"
                          label={`${roomType.size} m²`}
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {/* Actions */}
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<MoneyIcon />}
                      onClick={() => navigate(`/partner/hotels/${hotelId}/room-types/${roomType.id}/rates`)}
                    >
                      Fiyat Takvimi
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

export default RoomTypeManagement;