package com.bookinglite.controller;

import com.bookinglite.dto.response.ApiResponse;
import com.bookinglite.entity.RoomType;
import com.bookinglite.service.RoomTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/room-types")
@RequiredArgsConstructor
@Tag(name = "Room Types", description = "Oda tipi işlemleri")
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    /**
     * Otelin tüm oda tiplerini getir
     * GET /api/v1/room-types/hotel/{hotelId}
     */
    @GetMapping("/hotel/{hotelId}")
    @Operation(summary = "Otelin oda tipleri")
    public ResponseEntity<ApiResponse<List<RoomType>>> getHotelRoomTypes(
            @PathVariable Long hotelId
    ) {
        List<RoomType> roomTypes = roomTypeService.getRoomTypesByHotelId(hotelId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        roomTypes.size() + " oda tipi bulundu",
                        roomTypes
                )
        );
    }

    /**
     * Oda tipi detayı
     * GET /api/v1/room-types/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Oda tipi detayı")
    public ResponseEntity<ApiResponse<RoomType>> getRoomTypeById(
            @PathVariable Long id
    ) {
        return roomTypeService.getRoomTypeById(id)
                .map(roomType -> ResponseEntity.ok(
                        ApiResponse.success("Oda tipi bulundu", roomType)
                ))
                .orElse(ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Oda tipi bulunamadı!")));
    }

    /**
     * Yeni oda tipi oluştur
     * POST /api/v1/room-types
     */
    @PostMapping
    @Operation(summary = "Oda tipi oluştur", description = "Partner tarafından kullanılır")
    public ResponseEntity<ApiResponse<RoomType>> createRoomType(
            @Valid @RequestBody RoomType roomType
    ) {
        try {
            RoomType created = roomTypeService.createRoomType(roomType);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Oda tipi oluşturuldu", created));

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Oda tipi oluşturulamadı: " + e.getMessage()));
        }
    }

    /**
     * Oda tipi güncelle
     * PUT /api/v1/room-types/{id}
     */
    @PutMapping("/{id}")
    @Operation(summary = "Oda tipi güncelle")
    public ResponseEntity<ApiResponse<RoomType>> updateRoomType(
            @PathVariable Long id,
            @Valid @RequestBody RoomType roomType
    ) {
        try {
            RoomType updated = roomTypeService.updateRoomType(id, roomType);
            return ResponseEntity.ok(
                    ApiResponse.success("Oda tipi güncellendi", updated)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Oda tipi güncellenemedi: " + e.getMessage()));
        }
    }

    /**
     * Oda tipi sil
     * DELETE /api/v1/room-types/{id}
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Oda tipi sil", description = "DİKKAT: Rate calendar kayıtları da silinir!")
    public ResponseEntity<ApiResponse<Void>> deleteRoomType(
            @PathVariable Long id
    ) {
        try {
            roomTypeService.deleteRoomType(id);
            return ResponseEntity.ok(
                    ApiResponse.success("Oda tipi silindi")
            );

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Oda tipi silinemedi: " + e.getMessage()));
        }
    }
}
