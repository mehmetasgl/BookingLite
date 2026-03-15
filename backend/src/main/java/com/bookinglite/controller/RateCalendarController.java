package com.bookinglite.controller;

import com.bookinglite.dto.response.ApiResponse;
import com.bookinglite.entity.RateCalendar;
import com.bookinglite.service.RateCalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/v1/rate-calendar")
@RequiredArgsConstructor
@Tag(name = "Rate Calendar", description = "Fiyat ve stok takvimi")
public class RateCalendarController {

    private final RateCalendarService rateCalendarService;

    /**
     * Tarih aralığı için rate'leri getir
     * GET /api/v1/rate-calendar/room-type/{roomTypeId}
     */
    @GetMapping("/room-type/{roomTypeId}")
    @Operation(summary = "Oda tipi rate'lerini getir")
    public ResponseEntity<ApiResponse<List<RateCalendar>>> getRatesForRoomType(
            @PathVariable Long roomTypeId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        List<RateCalendar> rates = rateCalendarService.getRatesForDateRange(
                roomTypeId,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate)
        );

        return ResponseEntity.ok(
                ApiResponse.success(rates.size() + " rate bulundu", rates)
        );
    }

    /**
     * Tek bir tarih için rate oluştur güncelle
     * POST /api/v1/rate-calendar
     */
    @PostMapping
    @Operation(summary = "Rate oluştur/güncelle")
    public ResponseEntity<ApiResponse<RateCalendar>> upsertRate(
            @RequestParam Long roomTypeId,
            @RequestParam String date,
            @RequestParam Integer availableUnits,
            @RequestParam BigDecimal price,
            @RequestParam(defaultValue = "USD") String currency,
            @RequestParam(required = false) Integer minStay,
            @RequestParam(defaultValue = "false") Boolean stopSell
    ) {
        try {
            RateCalendar rate = rateCalendarService.upsertRate(
                    roomTypeId,
                    LocalDate.parse(date),
                    availableUnits,
                    price,
                    currency,
                    minStay,
                    stopSell
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Rate kaydedildi", rate));

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Rate kaydedilemedi: " + e.getMessage()));
        }
    }

    /**
     * Tarih aralığı için toplu rate oluştur
     * POST /api/v1/rate-calendar/bulk
     * 
     */
    @PostMapping("/bulk")
    @Operation(summary = "Toplu rate oluştur", 
               description = "Tarih aralığındaki tüm günlere aynı rate'i uygular")
    public ResponseEntity<ApiResponse<List<RateCalendar>>> bulkUpsertRates(
            @RequestParam Long roomTypeId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam Integer availableUnits,
            @RequestParam BigDecimal price,
            @RequestParam(defaultValue = "USD") String currency,
            @RequestParam(required = false) Integer minStay,
            @RequestParam(defaultValue = "false") Boolean stopSell
    ) {
        try {
            List<RateCalendar> rates = rateCalendarService.bulkUpsertRates(
                    roomTypeId,
                    LocalDate.parse(startDate),
                    LocalDate.parse(endDate),
                    availableUnits,
                    price,
                    currency,
                    minStay,
                    stopSell
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            rates.size() + " gün için rate kaydedildi", 
                            rates
                    ));

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Toplu rate kaydedilemedi: " + e.getMessage()));
        }
    }

    /**
     * Rate sil
     * DELETE /api/v1/rate-calendar/{id}
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Rate sil")
    public ResponseEntity<ApiResponse<Void>> deleteRate(@PathVariable Long id) {
        try {
            rateCalendarService.deleteRate(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Rate silindi")
            );

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Rate silinemedi: " + e.getMessage()));
        }
    }
}
