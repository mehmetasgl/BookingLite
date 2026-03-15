// src/pages/partner/RateCalendar.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

function RateCalendar() {
  const { hotelId, roomTypeId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    availableUnits: 5,
    price: '',
    currency: 'USD',
    minStay: 1,
    stopSell: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const startDateStr = format(formData.startDate, 'yyyy-MM-dd');
      const endDateStr = format(formData.endDate, 'yyyy-MM-dd');

      await api.post('/rate-calendar/bulk', null, {
        params: {
          roomTypeId,
          startDate: startDateStr,
          endDate: endDateStr,
          availableUnits: formData.availableUnits,
          price: parseFloat(formData.price),
          currency: formData.currency,
          minStay: formData.minStay,
          stopSell: formData.stopSell,
        },
      });

      setSuccess('Fiyat takvimi başarıyla oluşturuldu!');
      
      setFormData({
        startDate: null,
        endDate: null,
        availableUnits: 5,
        price: '',
        currency: 'USD',
        minStay: 1,
        stopSell: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Fiyat takvimi oluşturulurken hata oluştu!');
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
          onClick={() => navigate(`/partner/hotels/${hotelId}/room-types`)}
          sx={{ mb: 2 }}
        >
          Geri Dön
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            📅 Fiyat Takvimi Yönetimi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Seçtiğiniz tarih aralığı için fiyat ve stok bilgilerini girin.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={3}>
                {/* Date Range */}
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Başlangıç Tarihi"
                    value={formData.startDate}
                    onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
                    minDate={new Date()}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Bitiş Tarihi"
                    value={formData.endDate}
                    onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
                    minDate={formData.startDate || new Date()}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </Grid>

                {/* Available Units */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Müsait Oda Sayısı"
                    value={formData.availableUnits}
                    onChange={(e) => setFormData({ ...formData, availableUnits: parseInt(e.target.value) })}
                    inputProps={{ min: 1, max: 100 }}
                    required
                    helperText="Günlük satılabilir oda sayısı"
                  />
                </Grid>

                {/* Price */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Günlük Fiyat"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                    helperText="Gecelik oda fiyatı"
                  />
                </Grid>

                {/* Currency */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Para Birimi"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="USD">USD - Dolar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="TRY">TRY - Türk Lirası</option>
                  </TextField>
                </Grid>

                {/* Min Stay */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Konaklama"
                    value={formData.minStay}
                    onChange={(e) => setFormData({ ...formData, minStay: parseInt(e.target.value) })}
                    inputProps={{ min: 1, max: 30 }}
                    helperText="Minimum gece sayısı"
                  />
                </Grid>

                {/* Stop Sell */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="checkbox"
                      checked={formData.stopSell}
                      onChange={(e) => setFormData({ ...formData, stopSell: e.target.checked })}
                      id="stopSell"
                    />
                    <label htmlFor="stopSell">
                      <Typography variant="body2">
                        Stop Sell (Satışı Durdur) - Aktif edilirse bu tarihler için rezervasyon alınmaz
                      </Typography>
                    </label>
                  </Box>
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
                    {submitting ? <CircularProgress size={24} /> : 'Fiyat Takvimini Kaydet'}
                  </Button>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>

          {/* Info Box */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>💡 İpucu:</strong>
            </Typography>
            <Typography variant="body2">
              • Seçtiğiniz tarih aralığındaki tüm günler için aynı fiyat ve stok ayarlanır
            </Typography>
            <Typography variant="body2">
              • Daha sonra tekil günler için değişiklik yapabilirsiniz
            </Typography>
            <Typography variant="body2">
              • Stop Sell aktifse müşteriler bu tarihleri göremez
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default RateCalendar;
