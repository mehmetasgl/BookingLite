package com.bookinglite.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * FileStorageService - Local dosya yükleme servisi
 */
@Service
@Slf4j
public class FileStorageService {

    private final Path uploadDir;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.uploadDir);
            log.info("Upload dizini oluşturuldu: {}", this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Upload dizini oluşturulamadı!", e);
        }
    }

    /**
     * Tek dosya yükle
     */
    public String storeFile(MultipartFile file, String folder) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + extension;

            Path targetLocation = this.uploadDir.resolve(folder);
            Files.createDirectories(targetLocation);

            Path filePath = targetLocation.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + folder + "/" + fileName;
            log.info("Dosya kaydedildi: {}", fileUrl);
            
            return fileUrl;

        } catch (IOException e) {
            log.error("Dosya kaydetme hatası: {}", e.getMessage());
            throw new RuntimeException("Dosya kaydedilemedi: " + e.getMessage());
        }
    }

    public List<String> storeFiles(List<MultipartFile> files, String folder) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            urls.add(storeFile(file, folder));
        }
        return urls;
    }

    /**
     * Dosya sil
     */
    public void deleteFile(String fileUrl) {
        try {
            String relativePath = fileUrl.replace("/uploads/", "");
            Path filePath = this.uploadDir.resolve(relativePath);
            
            Files.deleteIfExists(filePath);
            log.info("Dosya silindi: {}", fileUrl);
            
        } catch (IOException e) {
            log.error("Dosya silme hatası: {}", e.getMessage());
            throw new RuntimeException("Dosya silinemedi: " + e.getMessage());
        }
    }

    /**
     * Dosya tipi kontrolü
     */
    public boolean isValidImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
                contentType.equals("image/jpeg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/webp")
        );
    }

    /**
     * Dosya boyutu kontrolü
     */
    public boolean isValidFileSize(MultipartFile file) {
        return file.getSize() <= 5 * 1024 * 1024; // 5MB
    }
}
