package com.bookinglite.service;

import com.bookinglite.entity.Hotel;
import com.bookinglite.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * HotelService - Otel iş mantığı (CACHE'Lİ)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;
    private final CacheService cacheService;

    /**
     * Tüm otelleri getir
     */
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    /**
     * ID ile otel getir
     */
    public Optional<Hotel> getHotelById(Long id) {
        String cacheKey = "hotel:detail:" + id;

        Object cached = cacheService.get(cacheKey);
        if (cached != null) {
            return Optional.of((Hotel) cached);
        }

        Optional<Hotel> hotel = hotelRepository.findById(id);

        hotel.ifPresent(h -> cacheService.set(cacheKey, h, 10));

        return hotel;
    }

    /**
     * Partner'ın otellerini getir
     */
    public List<Hotel> getHotelsByPartnerId(Long partnerUserId) {
        return hotelRepository.findByPartnerUserId(partnerUserId);
    }

    /**
     * Şehirdeki yayın otelleri getir
     */
    public List<Hotel> getPublishedHotelsByCity(String city) {
        String cacheKey = "hotels:search:" + city.toLowerCase();

        Object cached = cacheService.get(cacheKey);
        if (cached != null) {
            return (List<Hotel>) cached;
        }

        List<Hotel> hotels = hotelRepository.findByCityAndStatus(
                city,
                Hotel.HotelStatus.PUBLISHED
        );

        cacheService.set(cacheKey, hotels, 5);

        return hotels;
    }

    /**
     * Duruma göre otelleri getir
     */
    public List<Hotel> getHotelsByStatus(Hotel.HotelStatus status) {
        return hotelRepository.findByStatus(status);
    }

    /**
     * Otel ara
     */
    public List<Hotel> searchHotelsByName(String keyword) {
        return hotelRepository.searchByNameAndStatus(keyword, Hotel.HotelStatus.PUBLISHED);
    }

    /**
     * Yeni otel oluştur
     */
    @Transactional
    public Hotel createHotel(Hotel hotel) {
        hotel.setStatus(Hotel.HotelStatus.DRAFT);
        Hotel saved = hotelRepository.save(hotel);

        // Cache'i temizle
        cacheService.deletePattern("hotels:search:*");

        return saved;
    }

    /**
     * Otel güncelle
     */
    @Transactional
    public Hotel updateHotel(Long id, Hotel updatedHotel, Long requestingUserId) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Otel bulunamadı!"));

        if (!hotel.getPartnerUserId().equals(requestingUserId)) {
            throw new SecurityException("Bu oteli güncelleme yetkiniz yok!");
        }

        hotel.setName(updatedHotel.getName());
        hotel.setCity(updatedHotel.getCity());
        hotel.setAddress(updatedHotel.getAddress());
        hotel.setDescription(updatedHotel.getDescription());
        hotel.setCheckinTime(updatedHotel.getCheckinTime());
        hotel.setCheckoutTime(updatedHotel.getCheckoutTime());

        hotel.setMainImageUrl(updatedHotel.getMainImageUrl());
        hotel.setImagesJson(updatedHotel.getImagesJson());

        Hotel saved = hotelRepository.save(hotel);

        cacheService.delete("hotel:detail:" + id);
        cacheService.deletePattern("hotels:search:*");

        return saved;
    }

    /**
     * Otel durumunu değiştir
     */
    @Transactional
    public Hotel updateHotelStatus(Long id, Hotel.HotelStatus newStatus) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Otel bulunamadı!"));

        hotel.setStatus(newStatus);
        Hotel saved = hotelRepository.save(hotel);

        // Cache'i temizle
        cacheService.delete("hotel:detail:" + id);
        cacheService.deletePattern("hotels:search:*");

        return saved;
    }

    /**
     * Oteli yayınla
     */
    @Transactional
    public Hotel publishHotel(Long id) {
        return updateHotelStatus(id, Hotel.HotelStatus.PUBLISHED);
    }

    /**
     * Oteli askıya al
     */
    @Transactional
    public Hotel suspendHotel(Long id) {
        return updateHotelStatus(id, Hotel.HotelStatus.SUSPENDED);
    }

    /**
     * Otel sil
     */
    @Transactional
    public void deleteHotel(Long id, Long requestingUserId, boolean isAdmin) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Otel bulunamadı!"));

        if (!isAdmin && !hotel.getPartnerUserId().equals(requestingUserId)) {
            throw new SecurityException("Bu oteli silme yetkiniz yok!");
        }

        hotelRepository.deleteById(id);
        cacheService.delete("hotel:detail:" + id);
        cacheService.deletePattern("hotels:search:*");
    }

    /**
     * Şehirdeki otel sayısı
     */
    public long countHotelsByCity(String city) {
        return hotelRepository.countByCityAndStatus(city, Hotel.HotelStatus.PUBLISHED);
    }
}