package com.bookinglite.controller;

import com.bookinglite.dto.response.ApiResponse;
import com.bookinglite.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "Dosya yükleme işlemleri")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    /**
     * POST /api/v1/files/upload
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    @Operation(summary = "Tek dosya yükle")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Dosya boş!"));
            }

            if (!fileStorageService.isValidImageFile(file)) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Sadece JPEG, PNG, WEBP dosyaları yüklenebilir!"));
            }

            if (!fileStorageService.isValidFileSize(file)) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Dosya boyutu en fazla 5MB olabilir!"));
            }

            String fileUrl = fileStorageService.storeFile(file, folder);

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("fileName", file.getOriginalFilename());

            return ResponseEntity.ok(
                    ApiResponse.success("✅ Dosya yüklendi!", response)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Dosya yüklenemedi: " + e.getMessage()));
        }
    }

    /**
     * POST /api/v1/files/upload-multiple
     */
    @PostMapping("/upload-multiple")
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    @Operation(summary = "Çoklu dosya yükle")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("folder") String folder
    ) {
        try {
            if (files.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Dosya seçilmedi!"));
            }

            if (files.size() > 10) {
                return ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("En fazla 10 dosya yüklenebilir!"));
            }

            for (MultipartFile file : files) {
                if (!fileStorageService.isValidImageFile(file)) {
                    return ResponseEntity
                            .badRequest()
                            .body(ApiResponse.error("Geçersiz dosya formatı: " + file.getOriginalFilename()));
                }
                if (!fileStorageService.isValidFileSize(file)) {
                    return ResponseEntity
                            .badRequest()
                            .body(ApiResponse.error("Dosya çok büyük: " + file.getOriginalFilename()));
                }
            }

            List<String> urls = fileStorageService.storeFiles(files, folder);

            Map<String, Object> response = new HashMap<>();
            response.put("urls", urls);
            response.put("count", urls.size());

            return ResponseEntity.ok(
                    ApiResponse.success("✅ " + urls.size() + " dosya yüklendi!", response)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Dosyalar yüklenemedi: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/v1/files
     */
    @DeleteMapping
    @PreAuthorize("hasAnyRole('PARTNER', 'ADMIN')")
    @Operation(summary = "Dosya sil")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @RequestParam("url") String fileUrl
    ) {
        try {
            fileStorageService.deleteFile(fileUrl);
            return ResponseEntity.ok(
                    ApiResponse.success("Dosya silindi", null)
            );
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error("Dosya silinemedi: " + e.getMessage()));
        }
    }
}
