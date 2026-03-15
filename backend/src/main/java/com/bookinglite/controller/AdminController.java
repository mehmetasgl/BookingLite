package com.bookinglite.controller;

import com.bookinglite.dto.response.ApiResponse;
import com.bookinglite.dto.response.HotelResponse;
import com.bookinglite.entity.Hotel;
import com.bookinglite.entity.User;
import com.bookinglite.service.HotelService;
import com.bookinglite.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin panel işlemleri")
public class AdminController {

    private final HotelService hotelService;
    private final UserService userService;

    /**
     * GET /api/v1/admin/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Dashboard istatistikleri")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Otel istatistikleri
        List<Hotel> allHotels = hotelService.getAllHotels();
        long publishedCount = allHotels.stream()
                .filter(h -> h.getStatus() == Hotel.HotelStatus.PUBLISHED)
                .count();
        long draftCount = allHotels.stream()
                .filter(h -> h.getStatus() == Hotel.HotelStatus.DRAFT)
                .count();
        long suspendedCount = allHotels.stream()
                .filter(h -> h.getStatus() == Hotel.HotelStatus.SUSPENDED)
                .count();

        stats.put("totalHotels", allHotels.size());
        stats.put("publishedHotels", publishedCount);
        stats.put("draftHotels", draftCount);
        stats.put("suspendedHotels", suspendedCount);

        // Kullanıcı istatistikleri
        List<User> allUsers = userService.getAllUsers();
        long customerCount = allUsers.stream()
                .filter(u -> u.getRole() == User.UserRole.CUSTOMER)
                .count();
        long partnerCount = allUsers.stream()
                .filter(u -> u.getRole() == User.UserRole.PARTNER)
                .count();

        stats.put("totalUsers", allUsers.size());
        stats.put("customerCount", customerCount);
        stats.put("partnerCount", partnerCount);

        return ResponseEntity.ok(
                ApiResponse.success("İstatistikler getirildi", stats)
        );
    }

    /**
     * GET /api/v1/admin/hotels/pending
     */
    @GetMapping("/hotels/pending")
    @Operation(summary = "Onay bekleyen oteller")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getPendingHotels() {
        List<Hotel> pendingHotels = hotelService.getHotelsByStatus(Hotel.HotelStatus.DRAFT);
        List<HotelResponse> responses = pendingHotels.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success(pendingHotels.size() + " otel onay bekliyor", responses)
        );
    }

    /**
     * GET /api/v1/admin/hotels?status=PUBLISHED
     */
    @GetMapping("/hotels")
    @Operation(summary = "Tüm oteller")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> getAllHotels(
            @RequestParam(required = false) String status
    ) {
        List<Hotel> hotels;

        if (status != null) {
            Hotel.HotelStatus hotelStatus = Hotel.HotelStatus.valueOf(status.toUpperCase());
            hotels = hotelService.getHotelsByStatus(hotelStatus);
        } else {
            hotels = hotelService.getAllHotels();
        }

        List<HotelResponse> responses = hotels.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success(hotels.size() + " otel bulundu", responses)
        );
    }

    /**
     * POST /api/v1/admin/hotels/{id}/approve
     */
    @PostMapping("/hotels/{id}/approve")
    @Operation(summary = "Otel onayla", description = "DRAFT oteli PUBLISHED yapar")
    public ResponseEntity<ApiResponse<HotelResponse>> approveHotel(@PathVariable Long id) {
        try {
            Hotel hotel = hotelService.publishHotel(id);
            return ResponseEntity.ok(
                    ApiResponse.success("✅ Otel onaylandı ve yayınlandı!", toResponse(hotel))
            );
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Otel onaylanamadı: " + e.getMessage()));
        }
    }

    /**
     * POST /api/v1/admin/hotels/{id}/suspend
     */
    @PostMapping("/hotels/{id}/suspend")
    @Operation(summary = "Otel askıya al", description = "Oteli SUSPENDED yapar")
    public ResponseEntity<ApiResponse<HotelResponse>> suspendHotel(@PathVariable Long id) {
        try {
            Hotel hotel = hotelService.suspendHotel(id);
            return ResponseEntity.ok(
                    ApiResponse.success("⚠️ Otel askıya alındı", toResponse(hotel))
            );
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Otel askıya alınamadı: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/v1/admin/hotels/{id}/status
     */
    @PutMapping("/hotels/{id}/status")
    @Operation(summary = "Otel durumu değiştir")
    public ResponseEntity<ApiResponse<HotelResponse>> updateHotelStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        try {
            Hotel.HotelStatus newStatus = Hotel.HotelStatus.valueOf(status.toUpperCase());
            Hotel hotel = hotelService.updateHotelStatus(id, newStatus);

            return ResponseEntity.ok(
                    ApiResponse.success("Otel durumu güncellendi: " + newStatus, toResponse(hotel))
            );
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Durum güncellenemedi: " + e.getMessage()));
        }
    }

    /**
     * GET /api/v1/admin/users
     */
    @GetMapping("/users")
    @Operation(summary = "Tüm kullanıcılar")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<Map<String, Object>> userList = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("email", user.getEmail());
                    userMap.put("role", user.getRole().name());
                    userMap.put("createdAt", user.getCreatedAt());
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.success(users.size() + " kullanıcı bulundu", userList)
        );
    }

    /**
     * PUT /api/v1/admin/users/{id}/role
     */
    @PutMapping("/users/{id}/role")
    @Operation(summary = "Kullanıcı rolü değiştir")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role
    ) {
        try {
            User.UserRole newRole = User.UserRole.valueOf(role.toUpperCase());
            User user = userService.updateUserRole(id, newRole);

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());

            return ResponseEntity.ok(
                    ApiResponse.success("Kullanıcı rolü güncellendi", response)
            );
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Rol güncellenemedi: " + e.getMessage()));
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
