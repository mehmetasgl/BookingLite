package com.bookinglite.controller;

import com.bookinglite.dto.request.CreateReservationRequest;
import com.bookinglite.dto.response.ApiResponse;
import com.bookinglite.dto.response.ReservationResponse;
import com.bookinglite.entity.Hotel;
import com.bookinglite.entity.Reservation;
import com.bookinglite.entity.RoomType;
import com.bookinglite.service.HotelService;
import com.bookinglite.service.ReservationService;
import com.bookinglite.service.RoomTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Rezervasyon işlemleri")
public class ReservationController {

    private final ReservationService reservationService;
    private final HotelService hotelService;
    private final RoomTypeService roomTypeService;

    /**
     * GET /api/v1/reservations/check-availability
     */
    @GetMapping("/check-availability")
    @Operation(summary = "Müsaitlik kontrolü", description = "Tarih aralığında oda müsait mi kontrol eder")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @RequestParam Long roomTypeId,
            @RequestParam String checkin,
            @RequestParam String checkout
    ) {
        try {
            boolean available = reservationService.checkAvailability(
                    roomTypeId,
                    java.time.LocalDate.parse(checkin),
                    java.time.LocalDate.parse(checkout)
            );

            return ResponseEntity.ok(
                    ApiResponse.success(
                            available ? "Oda müsait! ✅" : "Oda müsait değil! ❌",
                            available
                    )
            );

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Kontrol başarısız: " + e.getMessage()));
        }
    }

    /**
     * Fiyat hesaplama
     * GET /api/v1/reservations/calculate-price
     */
    @GetMapping("/calculate-price")
    @Operation(summary = "Fiyat hesapla", description = "Tarih aralığı için toplam fiyatı hesaplar")
    public ResponseEntity<ApiResponse<BigDecimal>> calculatePrice(
            @RequestParam Long roomTypeId,
            @RequestParam String checkin,
            @RequestParam String checkout
    ) {
        try {
            BigDecimal totalPrice = reservationService.calculateTotalPrice(
                    roomTypeId,
                    java.time.LocalDate.parse(checkin),
                    java.time.LocalDate.parse(checkout)
            );

            return ResponseEntity.ok(
                    ApiResponse.success("Fiyat hesaplandı", totalPrice)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Fiyat hesaplanamadı: " + e.getMessage()));
        }
    }

    /**
     * Rezervasyon oluştur
     * POST /api/v1/reservations
     */
    @PostMapping
    @Operation(summary = "Rezervasyon oluştur", description = "Yeni rezervasyon yapar (stok düşer)")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());

            Reservation reservation = reservationService.createReservation(
                    request.getHotelId(),
                    request.getRoomTypeId(),
                    userId,
                    request.getCheckin(),
                    request.getCheckout(),
                    request.getGuestsAdults(),
                    request.getGuestsChildren(),
                    request.getGuestNotes()
            );

            ReservationResponse response = convertToResponse(reservation);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(
                            "🎉 Rezervasyon başarılı! Rezervasyon numaranız: " + reservation.getId(),
                            response
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("❌ Rezervasyon başarısız: " + e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Beklenmeyen hata: " + e.getMessage()));
        }
    }

    /**
     * GET /api/v1/reservations/my-reservations
     */
    @GetMapping("/my-reservations")
    @Operation(summary = "Rezervasyonlarım", description = "Kullanıcının tüm rezervasyonlarını getirir")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getMyReservations(
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());

        List<Reservation> reservations = reservationService.getUserReservations(userId);
        List<ReservationResponse> response = reservations.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success(
                        reservations.size() + " rezervasyon bulundu",
                        response
                )
        );
    }

    /**
     * GET /api/v1/reservations/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Rezervasyon detayı")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservationById(
            @PathVariable Long id
    ) {
        return reservationService.getReservationById(id)
                .map(reservation -> ResponseEntity.ok(
                        ApiResponse.success("Rezervasyon bulundu", convertToResponse(reservation))
                ))
                .orElse(ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Rezervasyon bulunamadı!")));
    }

    /**
     * Rezervasyon iptali
     * DELETE /api/v1/reservations/{id}
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Rezervasyon iptali", description = "Rezervasyonu iptal eder ve stok geri ekler")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());

            Reservation cancelledReservation = reservationService.cancelReservation(id, userId);

            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Rezervasyon iptal edildi. Stok geri eklendi.",
                            convertToResponse(cancelledReservation)
                    )
            );

        } catch (SecurityException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error(e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("İptal başarısız: " + e.getMessage()));
        }
    }

    /**
     * Otelin rezervasyonları
     * GET /api/v1/reservations/hotel/{hotelId}
     */
    @GetMapping("/hotel/{hotelId}")
    @Operation(summary = "Otelin rezervasyonları", description = "Partner paneli için")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getHotelReservations(
            @PathVariable Long hotelId
    ) {
        List<Reservation> reservations = reservationService.getHotelReservations(hotelId);
        List<ReservationResponse> response = reservations.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success(
                        reservations.size() + " rezervasyon bulundu",
                        response
                )
        );
    }

    /**
     * Bugünkü checkinler
     * GET /api/v1/reservations/today/checkins
     */
    @GetMapping("/today/checkins")
    @Operation(summary = "Bugünkü check-in'ler")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getTodaysCheckIns() {
        List<Reservation> reservations = reservationService.getTodaysCheckIns();
        List<ReservationResponse> response = reservations.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Bugün " + reservations.size() + " check-in var",
                        response
                )
        );
    }

    private ReservationResponse convertToResponse(Reservation reservation) {
        String hotelName = hotelService.getHotelById(reservation.getHotelId())
                .map(Hotel::getName)
                .orElse("Bilinmeyen Otel");

        String roomTypeName = roomTypeService.getRoomTypeById(reservation.getRoomTypeId())
                .map(RoomType::getName)
                .orElse("Bilinmeyen Oda Tipi");

        return ReservationResponse.builder()
                .id(reservation.getId())
                .hotelId(reservation.getHotelId())
                .hotelName(hotelName)
                .roomTypeId(reservation.getRoomTypeId())
                .roomTypeName(roomTypeName)
                .checkin(reservation.getCheckin())
                .checkout(reservation.getCheckout())
                .guestsAdults(reservation.getGuestsAdults())
                .guestsChildren(reservation.getGuestsChildren())
                .totalPrice(reservation.getTotalPrice())
                .currency(reservation.getCurrency())
                .status(reservation.getStatus().name())
                .guestNotes(reservation.getGuestNotes())
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}