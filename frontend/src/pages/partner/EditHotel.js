// src/pages/partner/EditHotel.js
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
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import ImageUpload from '../../components/common/ImageUpload';
import hotelService from '../../services/hotelService';
import Toast from '../../components/common/Toast';

function EditHotel() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    description: '',
    checkinTime: '14:00',
    checkoutTime: '12:00',
    mainImageUrl: '',
    imagesJson: '[]',
  });

  const [existingMainImage, setExistingMainImage] = useState(null);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);

  useEffect(() => {
    loadHotel();
  }, [hotelId]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getHotelById(hotelId);
      const hotel = response.data?.data || response.data;

      console.log('📸 Loaded hotel:', hotel);

      let galleryImages = [];
      if (hotel.imagesJson) {
        try {
          galleryImages = typeof hotel.imagesJson === 'string'
            ? JSON.parse(hotel.imagesJson)
            : hotel.imagesJson;
        } catch (e) {
          console.error('Failed to parse imagesJson:', e);
        }
      }
      if (Array.isArray(hotel.images)) {
        galleryImages = hotel.images;
      }

      setFormData({
        name: hotel.name || '',
        address: hotel.address || '',
        city: hotel.city || '',
        description: hotel.description || '',
        checkinTime: hotel.checkinTime || '14:00',
        checkoutTime: hotel.checkoutTime || '12:00',
        mainImageUrl: hotel.mainImageUrl || '',
        imagesJson: JSON.stringify(galleryImages),
      });

      if (hotel.mainImageUrl) {
        setExistingMainImage({
          url: hotel.mainImageUrl.startsWith('http')
            ? hotel.mainImageUrl
            : 'http://localhost:8080' + hotel.mainImageUrl,
          isNew: false,
        });
      }

      if (galleryImages.length > 0) {
        setExistingGalleryImages(
          galleryImages.map(url => ({
            url: url.startsWith('http') ? url : 'http://localhost:8080' + url,
            isNew: false,
          }))
        );
      }

    } catch (error) {
      console.error('Load hotel error:', error);
      showToast('Otel bilgileri yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

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
    setExistingMainImage({
      url: 'http://localhost:8080' + url,
      isNew: false,
    });
  };

  const handleGalleryUpload = (urls) => {
    console.log('📸 Gallery images uploaded:', urls);
    const currentImages = JSON.parse(formData.imagesJson || '[]');
    const allImages = [...currentImages, ...urls];

    setFormData(prev => ({
      ...prev,
      imagesJson: JSON.stringify(allImages),
    }));

    const newPreviews = urls.map(url => ({
      url: 'http://localhost:8080' + url,
      isNew: false,
    }));
    setExistingGalleryImages(prev => [...prev, ...newPreviews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    console.log('📤 Submitting hotel data:', formData);

    try {
      await hotelService.updateHotel(hotelId, formData);
      showToast('Otel güncellendi!', 'success');
      setTimeout(() => navigate('/partner/hotels'), 1500);
    } catch (error) {
      console.error('Update hotel error:', error);
      showToast('Otel güncellenemedi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (message, severity = 'info') => {
    setToast({ open: true, message, severity });
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
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/partner/hotels')}
          sx={{ mb: 2 }}
        >
          Geri Dön
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            ✏️ Otel Düzenle
          </Typography>

          {/* DEBUG INFO */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Debug: mainImageUrl = {formData.mainImageUrl || '(boş)'} |
            Gallery Count = {JSON.parse(formData.imagesJson || '[]').length}
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
                  existingImages={existingMainImage ? [existingMainImage] : []}
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
                  existingImages={existingGalleryImages}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Güncelle'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/partner/hotels')}
                  >
                    İptal
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Toast */}
        <Toast
          open={toast.open}
          message={toast.message}
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
        />
      </Container>
    </>
  );
}

export default EditHotel;