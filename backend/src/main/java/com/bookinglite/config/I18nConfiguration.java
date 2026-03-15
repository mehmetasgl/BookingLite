package com.bookinglite.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;

import java.util.Arrays;
import java.util.Locale;

/**
 * I18N Configuration
 * 
 * Desteklenen diller: TR, EN, DE, FR
 * 
 * Kullanım:
 * - Header: Accept-Language: tr
 * - Query param: ?lang=tr
 */
@Configuration
public class I18nConfiguration implements WebMvcConfigurer {

    /**
     * MessageSource - Dil dosyalarını yükler
     */
    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        
        // Dil dosyalarının yolu
        messageSource.setBasenames("i18n/messages");
        
        // Encoding
        messageSource.setDefaultEncoding("UTF-8");
        
        // Bulunamayan key için exception fırlatma
        messageSource.setUseCodeAsDefaultMessage(true);
        
        // Cache süresi (production'da 3600, dev'de -1)
        messageSource.setCacheSeconds(3600);
        
        return messageSource;
    }

    /**
     * LocaleResolver - Kullanıcı dilini belirler
     * 
     * Öncelik sırası:
     * 1. Query param: ?lang=tr
     * 2. Accept-Language header
     * 3. Varsayılan: EN
     */
    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver localeResolver = new AcceptHeaderLocaleResolver();
        
        // Varsayılan dil: İngilizce
        localeResolver.setDefaultLocale(Locale.ENGLISH);
        
        // Desteklenen diller
        localeResolver.setSupportedLocales(Arrays.asList(
            new Locale("tr"),  // Türkçe
            new Locale("en"),  // İngilizce
            new Locale("de"),  // Almanca
            new Locale("fr")   // Fransızca
        ));
        
        return localeResolver;
    }

    /**
     * LocaleChangeInterceptor - ?lang=tr parametresini dinler
     */
    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        
        // Query param adı
        interceptor.setParamName("lang");
        
        return interceptor;
    }

}
