// src/pages/partner/AddRoomType.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import Navbar from '../../components/layout/Navbar';
import hotelService from '../../services/hotelService';

function AddRoomType() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 2,
    bedType: 'DOUBLE',
    size: '',
    amenities: '',
  });

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getHotelById(hotelId);
      const hotelData = response.data?.data || response.data;
      setHotel(hotelData);
    } catch (error) {
      console.error('Otel yüklenemedi:', error);
      alert('Otel bulunamadı!');
      navigate('/partner/hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await hotelService.createRoomType(hotelId, formData);
      alert('Oda tipi eklendi!');
      navigate(`/partner/hotels/${hotelId}/room-types`);
    } catch (error) {
      console.error('Oda tipi eklenemedi:', error);
      alert('Oda tipi eklenemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
          ➕ Yeni Oda Tipi Ekle
        </Typography>
        {hotel && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {hotel.name}
          </Typography>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Oda Adı */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Oda Tipi Adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Deluxe Sea View"
                  required
                />
              </Grid>

              {/* Açıklama */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Açıklama"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Oda hakkında detaylı bilgi"
                />
              </Grid>

              {/* Kapasite */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Kapasite (Kişi)"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 10 }}
                  required
                />
              </Grid>

              {/* Yatak Tipi */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Yatak Tipi"
                  value={formData.bedType}
                  onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                  required
                >
                  <MenuItem value="SINGLE">Tek Kişilik</MenuItem>
                  <MenuItem value="DOUBLE">Çift Kişilik</MenuItem>
                  <MenuItem value="QUEEN">Queen</MenuItem>
                  <MenuItem value="KING">King</MenuItem>
                  <MenuItem value="TWIN">İki Ayrı Yatak</MenuItem>
                </TextField>
              </Grid>

              {/* Alan */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Alan (m²)"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="Örn: 35"
                />
              </Grid>

              {/* Olanaklar */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Olanaklar"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Örn: WiFi, TV, Minibar, Balkon"
                  helperText="Virgülle ayırın"
                />
              </Grid>

              {/* Butonlar */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={submitting}
                  >
                    {submitting ? 'Ekleniyor...' : 'Oda Tipini Ekle'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => navigate(`/partner/hotels/${hotelId}/room-types`)}
                  >
                    İptal
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default AddRoomType;
