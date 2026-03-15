// src/pages/customer/ReservationForm.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import Navbar from '../../components/layout/Navbar';
import hotelService from '../../services/hotelService';
import reservationService from '../../services/reservationService';

function ReservationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const roomTypeId = searchParams.get('roomTypeId');

  const [hotel, setHotel] = useState(null);
  const [roomType, setRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    checkin: null,
    checkout: null,
    guestsAdults: 2,
    guestsChildren: 0,
    guestNotes: '',
  });

  const [availability, setAvailability] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const hotelResponse = await hotelService.getHotelById(hotelId);
      setHotel(hotelResponse.data);

      const roomTypesResponse = await hotelService.getRoomTypes(hotelId);
      const selectedRoom = roomTypesResponse.data.find(rt => rt.id === parseInt(roomTypeId));
      setRoomType(selectedRoom);
    } catch (err) {
      setError('Bilgiler yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.checkin || !formData.checkout) return;

    try {
      const checkinStr = format(formData.checkin, 'yyyy-MM-dd');
      const checkoutStr = format(formData.checkout, 'yyyy-MM-dd');

      const availResponse = await reservationService.checkAvailability(
        roomTypeId,
        checkinStr,
        checkoutStr
      );

      const isAvailable = availResponse.data?.data !== undefined
        ? availResponse.data.data
        : availResponse.data;

      setAvailability(isAvailable);

      if (isAvailable) {
        const priceResponse = await reservationService.calculatePrice(
          roomTypeId,
          checkinStr,
          checkoutStr
        );

        const calculatedPrice = priceResponse.data?.data !== undefined
          ? priceResponse.data.data
          : priceResponse.data;

        setPrice(calculatedPrice);
      } else {
        setPrice(null);
      }
    } catch (err) {
      console.error('Müsaitlik kontrolü hatası:', err);
      setAvailability(false);
      setPrice(null);
    }
  };

  useEffect(() => {
    checkAvailability();
  }, [formData.checkin, formData.checkout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const reservationData = {
        hotelId: parseInt(hotelId),
        roomTypeId: parseInt(roomTypeId),
        checkin: format(formData.checkin, 'yyyy-MM-dd'),
        checkout: format(formData.checkout, 'yyyy-MM-dd'),
        guestsAdults: formData.guestsAdults,
        guestsChildren: formData.guestsChildren,
        guestNotes: formData.guestNotes,
      };

      await reservationService.createReservation(reservationData);
      setSuccess(true);

      setTimeout(() => {
        navigate('/my-reservations');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Rezervasyon yapılırken hata oluştu!');
    } finally {
      setSubmitting(false);
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
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Rezervasyon Yap
        </Typography>

        <Grid container spacing={3}>
          {/* Hotel Info */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">{hotel?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {roomType?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  👥 {roomType?.capacityAdults} Yetişkin, {roomType?.capacityChildren} Çocuk
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Form */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Rezervasyon başarılı! Yönlendiriliyorsunuz...
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Giriş Tarihi"
                        value={formData.checkin}
                        onChange={(newValue) => setFormData({ ...formData, checkin: newValue })}
                        minDate={new Date()}
                        slotProps={{ textField: { fullWidth: true, required: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Çıkış Tarihi"
                        value={formData.checkout}
                        onChange={(newValue) => setFormData({ ...formData, checkout: newValue })}
                        minDate={formData.checkin || new Date()}
                        slotProps={{ textField: { fullWidth: true, required: true } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Yetişkin Sayısı"
                        value={formData.guestsAdults}
                        onChange={(e) => setFormData({ ...formData, guestsAdults: parseInt(e.target.value) })}
                        inputProps={{ min: 1, max: roomType?.capacityAdults }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Çocuk Sayısı"
                        value={formData.guestsChildren}
                        onChange={(e) => setFormData({ ...formData, guestsChildren: parseInt(e.target.value) })}
                        inputProps={{ min: 0, max: roomType?.capacityChildren }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notlar (Opsiyonel)"
                        value={formData.guestNotes}
                        onChange={(e) => setFormData({ ...formData, guestNotes: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>

                {/* Availability & Price */}
                {formData.checkin && formData.checkout && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    {availability === true && price !== null && (
                      <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          ✅ Oda Müsait!
                        </Typography>
                        <Typography variant="h5">
                          Toplam Fiyat: ${price}
                        </Typography>
                      </Box>
                    )}
                    {availability === false && (
                      <Alert severity="error">
                        Seçtiğiniz tarihler için oda müsait değil!
                      </Alert>
                    )}
                  </Box>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3 }}
                  disabled={submitting || !availability || !price}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Rezervasyonu Tamamla'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default ReservationForm;