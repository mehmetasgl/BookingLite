// src/pages/partner/AddHotel.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import ImageUpload from '../../components/common/ImageUpload';
import hotelService from '../../services/hotelService';

function AddHotel() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    description: '',
    checkinTime: '14:00',
    checkoutTime: '12:00',
    mainImageUrl: '',
    imagesJson: '[]',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMainImageUpload = (url) => {
    console.log('📸 Main image uploaded:', url);
    setFormData(prev => ({
      ...prev,
      mainImageUrl: url,
    }));
  };

  const handleGalleryUpload = (urls) => {
    console.log('📸 Gallery images uploaded:', urls);
    setFormData(prev => ({
      ...prev,
      imagesJson: JSON.stringify(urls),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    console.log('📤 Submitting hotel data:', formData);

    try {
      const response = await hotelService.createHotel(formData);
      console.log('✅ Hotel created:', response.data);
      setSuccess(true);

      setTimeout(() => {
        navigate('/partner/hotels');
      }, 1500);
    } catch (err) {
      console.error('❌ Hotel creation error:', err);
      setError(err.response?.data?.message || 'Otel eklenirken hata oluştu!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/partner/hotels')}
          sx={{ mb: 2 }}
        >
          Geri Dön
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            🏨 Yeni Otel Ekle
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Otel başarıyla eklendi! Yönlendiriliyorsunuz...
            </Alert>
          )}

          {/* DEBUG INFO */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Debug: mainImageUrl = {formData.mainImageUrl || '(boş)'}
          </Alert>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Temel Bilgiler */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Temel Bilgiler
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Otel Adı"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Şehir"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Adres"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Açıklama"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Check-in Saati"
                  name="checkinTime"
                  value={formData.checkinTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Check-out Saati"
                  name="checkoutTime"
                  value={formData.checkoutTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              {/* Fotoğraflar */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  📸 Fotoğraflar
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Ana Fotoğraf
                </Typography>
                <ImageUpload
                  folder="hotels"
                  multiple={false}
                  onUploadSuccess={handleMainImageUpload}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Galeri Fotoğrafları (Opsiyonel)
                </Typography>
                <ImageUpload
                  folder="hotels"
                  multiple={true}
                  onUploadSuccess={handleGalleryUpload}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Otel Ekle'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default AddHotel;