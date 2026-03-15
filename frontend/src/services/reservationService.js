// src/services/reservationService.js
import api from './api';

const reservationService = {
  // Müsaitlik kontrolü
  checkAvailability: async (roomTypeId, checkin, checkout) => {
    return api.get('/reservations/check-availability', {
      params: { roomTypeId, checkin, checkout }
    });
  },

  // Fiyat hesaplama
  calculatePrice: async (roomTypeId, checkin, checkout) => {
    return api.get('/reservations/calculate-price', {
      params: { roomTypeId, checkin, checkout }
    });
  },

  // Rezervasyon oluştur
  createReservation: async (reservationData) => {
    return api.post('/reservations', reservationData);
  },

  // Kullanıcının rezervasyonları
  getMyReservations: async () => {
    return api.get('/reservations/my-reservations');
  },

  // Rezervasyon iptal et
  cancelReservation: async (id) => {
    return api.delete(`/reservations/${id}`);
  },

  // Rezervasyon detayı
  getReservationById: async (id) => {
    return api.get(`/reservations/${id}`);
  }
};

export default reservationService;