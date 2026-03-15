package com.bookinglite.security;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Service;

/**
 * XSS Prevention Service

 */
@Service
public class XssPreventionService {

    private static final PolicyFactory TEXT_ONLY = new HtmlPolicyBuilder()
            .toFactory();

    private static final PolicyFactory BASIC_FORMATTING = new HtmlPolicyBuilder()
            .allowElements("b", "i", "u", "em", "strong", "br", "p")
            .toFactory();

    private static final PolicyFactory RICH_TEXT = new HtmlPolicyBuilder()
            .allowElements("b", "i", "u", "em", "strong", "br", "p", "div", "span",
                    "h1", "h2", "h3", "h4", "h5", "h6",
                    "ul", "ol", "li", "a", "img")
            .allowAttributes("href").onElements("a")
            .allowAttributes("src", "alt", "width", "height").onElements("img")
            .allowAttributes("class").globally()
            .requireRelNofollowOnLinks()
            .toFactory();

    /**
     * Tüm HTML'i kaldırır, sadece text kalır
     */
    public String sanitizeToText(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return TEXT_ONLY.sanitize(input);
    }

    public String sanitize(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        String cleaned = TEXT_ONLY.sanitize(input);

        cleaned = cleaned.replaceAll("(?i)javascript:", "");
        cleaned = cleaned.replaceAll("(?i)data:", "");
        cleaned = cleaned.replaceAll("(?i)vbscript:", "");
        cleaned = cleaned.replaceAll("(?i)file:", "");

        return cleaned.trim();
    }

    /**
     * Rich text editor içeriği için
     */
    public String sanitizeRichText(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return RICH_TEXT.sanitize(input);
    }

    /**
     * Temel formatting'e izin verir
     */
    public String sanitizeBasic(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return BASIC_FORMATTING.sanitize(input);
    }

    /**
     * URL validation
     */
    public boolean isValidUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }

        String lowerUrl = url.toLowerCase();

        if (lowerUrl.startsWith("javascript:") ||
                lowerUrl.startsWith("data:") ||
                lowerUrl.startsWith("vbscript:") ||
                lowerUrl.startsWith("file:")) {
            return false;
        }

        return lowerUrl.startsWith("http://") ||
                lowerUrl.startsWith("https://") ||
                !lowerUrl.contains(":");
    }

    /**
     * SQL Injection koruması
     */
    public String escapeSqlInput(String input) {
        if (input == null) {
            return null;
        }
        return input.replace("'", "''");
    }

    /**
     * File path traversal koruması
     */
    public boolean isValidFilePath(String path) {
        if (path == null || path.isEmpty()) {
            return false;
        }

        return !path.contains("..") &&
                !path.contains("./") &&
                !path.contains("\\");
    }

    /**
     * Email validation
     */
    public boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }

        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.matches(emailRegex);
    }

    /**
     * HTML encode
     */
    public String htmlEncode(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}