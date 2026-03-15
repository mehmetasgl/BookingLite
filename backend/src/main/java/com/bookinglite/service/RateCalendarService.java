package com.bookinglite.service;

import com.bookinglite.entity.RateCalendar;
import com.bookinglite.repository.RateCalendarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RateCalendarService {

    private final RateCalendarRepository rateCalendarRepository;
    private final CacheService cacheService;

    public Optional<RateCalendar> getRateForDate(Long roomTypeId, LocalDate date) {
        return rateCalendarRepository.findByRoomTypeIdAndDate(roomTypeId, date);
    }

    public List<RateCalendar> getRatesForDateRange(
            Long roomTypeId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return rateCalendarRepository.findByRoomTypeIdAndDateBetween(
                roomTypeId, startDate, endDate
        );
    }

    @Transactional
    public RateCalendar upsertRate(
            Long roomTypeId,
            LocalDate date,
            Integer availableUnits,
            BigDecimal price,
            String currency,
            Integer minStay,
            Boolean stopSell
    ) {
        Optional<RateCalendar> existing = rateCalendarRepository
                .findByRoomTypeIdAndDate(roomTypeId, date);

        RateCalendar rate;
        if (existing.isPresent()) {
            rate = existing.get();
            rate.setAvailableUnits(availableUnits);
            rate.setPrice(price);
            rate.setCurrency(currency);
            rate.setMinStay(minStay);
            rate.setStopSell(stopSell);
        } else {
            rate = RateCalendar.builder()
                    .roomTypeId(roomTypeId)
                    .date(date)
                    .availableUnits(availableUnits)
                    .price(price)
                    .currency(currency)
                    .minStay(minStay)
                    .stopSell(stopSell)
                    .build();
        }

        RateCalendar saved = rateCalendarRepository.save(rate);
        String pattern = String.format("price:roomtype:%d:*", roomTypeId);
        cacheService.deletePattern(pattern);

        return saved;
    }

    @Transactional
    public List<RateCalendar> bulkUpsertRates(
            Long roomTypeId,
            LocalDate startDate,
            LocalDate endDate,
            Integer availableUnits,
            BigDecimal price,
            String currency,
            Integer minStay,
            Boolean stopSell
    ) {
        List<RateCalendar> rates = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            RateCalendar rate = upsertRate(
                    roomTypeId, currentDate, availableUnits,
                    price, currency, minStay, stopSell
            );
            rates.add(rate);
            currentDate = currentDate.plusDays(1);
        }
        String pattern = String.format("price:roomtype:%d:*", roomTypeId);
        cacheService.deletePattern(pattern);

        return rates;
    }

    /**
     * Rate sil
     */
    @Transactional
    public void deleteRate(Long id) {
        RateCalendar rate = rateCalendarRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fiyat bulunamadı!"));

        Long roomTypeId = rate.getRoomTypeId();
        rateCalendarRepository.deleteById(id);
        String pattern = String.format("price:roomtype:%d:*", roomTypeId);
        cacheService.deletePattern(pattern);
    }

    @Transactional
    public void deleteAllRatesForRoomType(Long roomTypeId) {
        rateCalendarRepository.deleteByRoomTypeId(roomTypeId);
        String pattern = String.format("price:roomtype:%d:*", roomTypeId);
        cacheService.deletePattern(pattern);
    }
}