// src/services/hotelService.js

import api from './api';


const hotelService = {
  /**
   * Tüm otelleri getir
   */
  getAllHotels: () => {
    return api.get('/hotels');
  },

  /**
   * ID ile otel getir
   */
  getHotelById: (id) => {
    return api.get(`/hotels/${id}`);
  },

  /**
   * Şehre göre otel ara
   */
  searchHotels: (city) => {
    return api.get(`/hotels/search?city=${city}`);
  },

  /**
   * Partner'ın otelleri
   */
  getMyHotels: () => {
    return api.get('/hotels/my-hotels');
  },

  /**
   * Yeni otel oluştur
   */
  createHotel: (hotelData) => {
    return api.post('/hotels', {
      name: hotelData.name,
      city: hotelData.city,
      address: hotelData.address,
      description: hotelData.description,
      checkinTime: hotelData.checkinTime,
      checkoutTime: hotelData.checkoutTime,
      mainImageUrl: hotelData.mainImageUrl || null,
      imagesJson: hotelData.imagesJson || '[]',
    });
  },

  /**
   * Otel güncelle
   */
  updateHotel: (id, hotelData) => {
    return api.put(`/hotels/${id}`, {
      name: hotelData.name,
      city: hotelData.city,
      address: hotelData.address,
      description: hotelData.description,
      checkinTime: hotelData.checkinTime,
      checkoutTime: hotelData.checkoutTime,
      mainImageUrl: hotelData.mainImageUrl || null,
      imagesJson: hotelData.imagesJson || '[]',
    });
  },

  /**
   * Otel sil
   */
  deleteHotel: (id) => {
    return api.delete(`/hotels/${id}`);
  },

  /**
   * Oda tiplerini getir
   */
  getRoomTypes: (hotelId) => {
    return api.get(`/room-types/hotel/${hotelId}`);
  },

  /**
   * Oda tipi oluştur
   */
  createRoomType: (roomTypeData) => {
    return api.post('/room-types', roomTypeData);
  },

  createRoomType: async (hotelId, roomTypeData) => {
    return api.post(`/hotels/${hotelId}/room-types`, roomTypeData);
  },

  deleteRoomType: async (hotelId, roomTypeId) => {
    return api.delete(`/hotels/${hotelId}/room-types/${roomTypeId}`);
  },
};

export default hotelService;