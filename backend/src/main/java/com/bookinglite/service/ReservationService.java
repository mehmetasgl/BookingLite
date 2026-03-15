package com.bookinglite.service;

import com.bookinglite.entity.*;
import com.bookinglite.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RateCalendarRepository rateCalendarRepository;
    private final CacheService cacheService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;

    public List<Reservation> getUserReservations(Long userId) {
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Reservation> getHotelReservations(Long hotelId) {
        return reservationRepository.findByHotelIdOrderByCheckinDesc(hotelId);
    }

    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    public boolean checkAvailability(Long roomTypeId, LocalDate checkin, LocalDate checkout) {
        long nights = ChronoUnit.DAYS.between(checkin, checkout);

        if (nights <= 0) {
            throw new IllegalArgumentException("Checkout tarihi checkin'den sonra olmalı!");
        }

        return rateCalendarRepository.isAvailableForAllDates(
                roomTypeId,
                checkin,
                checkout.minusDays(1),
                1,
                nights
        );
    }

    /**
     * Toplam fiyat hesapla
     */
    public BigDecimal calculateTotalPrice(
            Long roomTypeId,
            LocalDate checkin,
            LocalDate checkout
    ) {
        final LocalDate finalCheckin = checkin;
        final LocalDate finalCheckout = checkout;

        String cacheKey = String.format(
                "price:roomtype:%d:%s:%s",
                roomTypeId,
                finalCheckin.toString(),
                finalCheckout.toString()
        );

        Object cached = cacheService.get(cacheKey);
        if (cached != null) {
            return (BigDecimal) cached;
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        LocalDate currentDate = finalCheckin;

        while (currentDate.isBefore(finalCheckout)) {
            final LocalDate dateForLambda = currentDate;

            RateCalendar rate = rateCalendarRepository
                    .findByRoomTypeIdAndDate(roomTypeId, dateForLambda)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Bu tarih için fiyat bulunamadı: " + dateForLambda
                    ));

            totalPrice = totalPrice.add(rate.getPrice());
            currentDate = currentDate.plusDays(1);
        }

        cacheService.set(cacheKey, totalPrice, 60);
        return totalPrice;
    }

    /**
     * REZERVASYON OLUŞTUR Email ile
     */
    @Transactional
    public Reservation createReservation(
            Long hotelId,
            Long roomTypeId,
            Long userId,
            LocalDate checkin,
            LocalDate checkout,
            Integer guestsAdults,
            Integer guestsChildren,
            String guestNotes
    ) {
        if (checkout.isBefore(checkin) || checkout.isEqual(checkin)) {
            throw new IllegalArgumentException("Checkout tarihi checkin'den sonra olmalı!");
        }

        long nights = ChronoUnit.DAYS.between(checkin, checkout);

        List<RateCalendar> rates = rateCalendarRepository.findByRoomTypeIdAndDateBetweenWithLock(
                roomTypeId,
                checkin,
                checkout.minusDays(1)
        );

        if (rates.size() != nights) {
            throw new IllegalArgumentException(
                    "Seçilen tarihler için fiyat bilgisi eksik! " +
                            "Beklenen: " + nights + " gün, Bulunan: " + rates.size() + " gün"
            );
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (RateCalendar rate : rates) {
            if (rate.getStopSell()) {
                throw new IllegalArgumentException(
                        "Tarih: " + rate.getDate() + " için satış kapalı!"
                );
            }

            if (rate.getAvailableUnits() < 1) {
                throw new IllegalArgumentException(
                        "Tarih: " + rate.getDate() + " için müsait oda kalmadı!"
                );
            }

            if (rate.getMinStay() != null && nights < rate.getMinStay()) {
                throw new IllegalArgumentException(
                        "Bu tarihler için minimum " + rate.getMinStay() + " gece konaklama gerekli!"
                );
            }

            totalPrice = totalPrice.add(rate.getPrice());
        }

        for (RateCalendar rate : rates) {
            rate.setAvailableUnits(rate.getAvailableUnits() - 1);
            rateCalendarRepository.save(rate);
        }

        Reservation reservation = Reservation.builder()
                .hotelId(hotelId)
                .roomTypeId(roomTypeId)
                .userId(userId)
                .checkin(checkin)
                .checkout(checkout)
                .guestsAdults(guestsAdults)
                .guestsChildren(guestsChildren)
                .totalPrice(totalPrice)
                .currency("USD")
                .status(Reservation.ReservationStatus.CONFIRMED)
                .guestNotes(guestNotes)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        try {
            User customer = userRepository.findById(userId).orElseThrow();
            Hotel hotel = hotelRepository.findById(hotelId).orElseThrow();
            RoomType roomType = roomTypeRepository.findById(roomTypeId).orElseThrow();

            emailService.sendReservationConfirmation(customer, saved, hotel, roomType);

            User partner = userRepository.findById(hotel.getPartnerUserId()).orElseThrow();
            emailService.sendNewReservationNotification(partner, saved, hotel, roomType, customer);

        } catch (Exception e) {
            log.error("Email gönderme hatası (rezervasyon oluşturuldu): {}", e.getMessage());
        }

        return saved;
    }

    /**
     * REZERVASYON İPTALİ Email ile
     */
    @Transactional
    public Reservation cancelReservation(Long reservationId, Long requestingUserId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Rezervasyon bulunamadı!"));

        if (!reservation.getUserId().equals(requestingUserId)) {
            throw new SecurityException("Bu rezervasyonu iptal etme yetkiniz yok!");
        }

        if (reservation.getStatus() == Reservation.ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Rezervasyon zaten iptal edilmiş!");
        }

        if (reservation.getCheckin().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Geçmiş tarihli rezervasyon iptal edilemez!");
        }

        List<RateCalendar> rates = rateCalendarRepository.findByRoomTypeIdAndDateBetween(
                reservation.getRoomTypeId(),
                reservation.getCheckin(),
                reservation.getCheckout().minusDays(1)
        );

        for (RateCalendar rate : rates) {
            rate.setAvailableUnits(rate.getAvailableUnits() + 1);
            rateCalendarRepository.save(rate);
        }

        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        Reservation cancelled = reservationRepository.save(reservation);

        try {
            User customer = userRepository.findById(reservation.getUserId()).orElseThrow();
            Hotel hotel = hotelRepository.findById(reservation.getHotelId()).orElseThrow();
            RoomType roomType = roomTypeRepository.findById(reservation.getRoomTypeId()).orElseThrow();
            User partner = userRepository.findById(hotel.getPartnerUserId()).orElseThrow();

            emailService.sendCancellationNotification(customer, cancelled, hotel, roomType, true);
            emailService.sendCancellationNotification(partner, cancelled, hotel, roomType, false);

        } catch (Exception e) {
            log.error("Email gönderme hatası (iptal oluşturuldu): {}", e.getMessage());
        }

        return cancelled;
    }

    public List<Reservation> getTodaysCheckIns() {
        return reservationRepository.findTodaysCheckIns(LocalDate.now());
    }

    public List<Reservation> getTodaysCheckOuts() {
        return reservationRepository.findTodaysCheckOuts(LocalDate.now());
    }
}