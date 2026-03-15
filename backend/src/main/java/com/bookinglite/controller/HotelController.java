package com.bookinglite.controller;

import com.bookinglite.dto.request.CreateHotelRequest;
import com.bookinglite.dto.response.ApiResponse;
import com.bookinglite.dto.response.HotelResponse;
import com.bookinglite.entity.Hotel;
import com.bookinglite.security.XssPreventionService;
import com.bookinglite.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotels", description = "Otel yönetimi")
public class HotelController {

    private final HotelService hotelService;

    @Autowired
    private XssPreventionService xssService;

    /**
     * GET /api/v1/hotels
     */
    @GetMapping
    @Operation(summary = "Tüm oteller", description = "Tüm otelleri listeler")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getAllHotels() {
        List<Hotel> hotels = hotelService.getAllHotels();
        List<HotelResponse> responses = hotels.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success("Oteller listelendi", responses)
        );
    }

    /**
     * GET /api/v1/hotels/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Otel detayı", description = "ID ile otel detayını getirir")
    public ResponseEntity<ApiResponse<HotelResponse>> getHotelById(@PathVariable Long id) {
        Hotel hotel = hotelService.getHotelById(id)
                .orElseThrow(() -> new IllegalArgumentException("Otel bulunamadı!"));

        return ResponseEntity.ok(
                ApiResponse.success("Otel bulundu", toResponse(hotel))
        );
    }

    /**
     * GET /api/v1/hotels/search?city=Istanbul
     */
    @GetMapping("/search")
    @Operation(summary = "Otel ara", description = "Şehre göre yayında olan otelleri arar")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> searchHotels(
            @RequestParam String city
    ) {
        // ✅ XSS koruması - search parametresi
        String safeCity = xssService.sanitize(city);

        List<Hotel> hotels = hotelService.getPublishedHotelsByCity(safeCity);
        List<HotelResponse> responses = hotels.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success(hotels.size() + " otel bulundu", responses)
        );
    }

    /**
     * Yeni otel oluştur
     * POST /api/v1/hotels
     */
    @PostMapping
    @Operation(summary = "Yeni otel", description = "Yeni otel oluşturur (Partner)")
    public ResponseEntity<ApiResponse<HotelResponse>> createHotel(
            @Valid @RequestBody CreateHotelRequest request,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());

            // ✅ XSS Prevention - TÜM alanları temizle
            String safeName = xssService.sanitize(request.getName());
            String safeDescription = xssService.sanitizeBasic(request.getDescription());
            String safeCity = xssService.sanitize(request.getCity());
            String safeAddress = xssService.sanitize(request.getAddress());  // ← ÖNEMLİ!

            Hotel hotel = new Hotel();
            hotel.setName(safeName);
            hotel.setCity(safeCity);  // ✅ Temizlenmiş
            hotel.setAddress(safeAddress);  // ✅ Temizlenmiş - ÖNCEKİ HATALI!
            hotel.setDescription(safeDescription);  // ✅ Temizlenmiş
            hotel.setCheckinTime(request.getCheckinTime());
            hotel.setCheckoutTime(request.getCheckoutTime());
            hotel.setPartnerUserId(userId);
            hotel.setStatus(Hotel.HotelStatus.DRAFT);
            hotel.setMainImageUrl(request.getMainImageUrl());
            hotel.setImagesJson(request.getImagesJson());

            Hotel savedHotel = hotelService.createHotel(hotel);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Otel oluşturuldu", toResponse(savedHotel)));

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Otel oluşturulamadı: " + e.getMessage()));
        }
    }

    /**
     * Otel güncelle
     * PUT /api/v1/hotels/{id}
     */
    @PutMapping("/{id}")
    @Operation(summary = "Otel güncelle", description = "Otel bilgilerini günceller")
    public ResponseEntity<ApiResponse<HotelResponse>> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody CreateHotelRequest request,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());

            // ✅ XSS Prevention
            String safeName = xssService.sanitize(request.getName());
            String safeDescription = xssService.sanitizeBasic(request.getDescription());
            String safeCity = xssService.sanitize(request.getCity());
            String safeAddress = xssService.sanitize(request.getAddress());

            Hotel hotel = new Hotel();
            hotel.setName(safeName);
            hotel.setCity(safeCity);
            hotel.setAddress(safeAddress);
            hotel.setDescription(safeDescription);
            hotel.setCheckinTime(request.getCheckinTime());
            hotel.setCheckoutTime(request.getCheckoutTime());
            hotel.setMainImageUrl(request.getMainImageUrl());
            hotel.setImagesJson(request.getImagesJson());

            Hotel updatedHotel = hotelService.updateHotel(id, hotel, userId);

            return ResponseEntity.ok(
                    ApiResponse.success("Otel güncellendi", toResponse(updatedHotel))
            );

        } catch (SecurityException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Otel güncellenemedi: " + e.getMessage()));
        }
    }

    /**
     * Partner'ın otelleri
     * GET /api/v1/hotels/my-hotels
     */
    @GetMapping("/my-hotels")
    @Operation(summary = "Otellerim", description = "Partner'ın otellerini listeler")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getMyHotels(
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());

            List<Hotel> hotels = hotelService.getHotelsByPartnerId(userId);
            List<HotelResponse> responses = hotels.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    ApiResponse.success(hotels.size() + " otel bulundu", responses)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Oteller getirilemedi: " + e.getMessage()));
        }
    }

    /**
     * Otel sil
     * DELETE /api/v1/hotels/{id}
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Otel sil", description = "Otel siler (Partner)")
    public ResponseEntity<ApiResponse<Void>> deleteHotel(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());

            hotelService.deleteHotel(id, userId, false);

            return ResponseEntity.ok(
                    ApiResponse.success("Otel silindi", null)
            );

        } catch (SecurityException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Otel silinemedi: " + e.getMessage()));
        }
    }

    // DTO Dönüşümü
    private HotelResponse toResponse(Hotel hotel) {
        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .city(hotel.getCity())
                .address(hotel.getAddress())
                .description(hotel.getDescription())
                .checkinTime(hotel.getCheckinTime())
                .checkoutTime(hotel.getCheckoutTime())
                .status(hotel.getStatus().name())
                .partnerUserId(hotel.getPartnerUserId())
                .mainImageUrl(hotel.getMainImageUrl())
                .imagesJson(hotel.getImagesJson())
                .build();
    }
}