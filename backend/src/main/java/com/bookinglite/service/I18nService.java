package com.bookinglite.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;

/**
 * I18N Service - Mesaj Çevirme Servisi
 * 
 * Kullanım:
 * String message = i18nService.getMessage("hotel.created");
 * String messageWithParam = i18nService.getMessage("ratelimit.exceeded", 60);
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class I18nService {

    private final MessageSource messageSource;

    /**
     * Mesaj al (mevcut locale ile)
     * 
     * @param key Mesaj anahtarı (örn: "hotel.created")
     * @return Çevrilmiş mesaj
     */
    public String getMessage(String key) {
        return getMessage(key, (Object[]) null);
    }

    /**
     * Parametreli mesaj al
     * 
     * @param key Mesaj anahtarı
     * @param args Parametreler
     * @return Çevrilmiş mesaj
     * 
     * Örnek:
     * getMessage("validation.required", "Email") 
     * → "Email is required" (EN)
     * → "Email zorunludur" (TR)
     */
    public String getMessage(String key, Object... args) {
        try {
            Locale locale = LocaleContextHolder.getLocale();
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            log.warn("Message not found for key: {} - Locale: {}", key, LocaleContextHolder.getLocale());
            return key; // Key bulunamazsa key'i döndür
        }
    }

    /**
     * Belirli bir dil için mesaj al
     * 
     * @param key Mesaj anahtarı
     * @param locale Dil
     * @return Çevrilmiş mesaj
     */
    public String getMessage(String key, Locale locale) {
        return getMessage(key, locale, (Object[]) null);
    }

    /**
     * Belirli bir dil için parametreli mesaj al
     * 
     * @param key Mesaj anahtarı
     * @param locale Dil
     * @param args Parametreler
     * @return Çevrilmiş mesaj
     */
    public String getMessage(String key, Locale locale, Object... args) {
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            log.warn("Message not found for key: {} - Locale: {}", key, locale);
            return key;
        }
    }

    /**
     * Mevcut dili al
     * 
     * @return Mevcut locale
     */
    public Locale getCurrentLocale() {
        return LocaleContextHolder.getLocale();
    }

    /**
     * Mevcut dil kodunu al
     * 
     * @return Dil kodu (tr, en, de, fr)
     */
    public String getCurrentLanguage() {
        return LocaleContextHolder.getLocale().getLanguage();
    }
}
