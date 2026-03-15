package com.bookinglite.security;

import com.bookinglite.service.CacheService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Rate Limiting Interceptor
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final CacheService cacheService;

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final int MAX_REQUESTS_PER_HOUR = 1000;

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) throws Exception {

        String clientIp = getClientIp(request);
        String userId = getUserId(request);

        String rateLimitKey = userId != null
                ? "ratelimit:user:" + userId
                : "ratelimit:ip:" + clientIp;

        String minuteKey = rateLimitKey + ":minute:" + getCurrentMinute();
        int minuteCount = getCount(minuteKey);

        if (minuteCount >= MAX_REQUESTS_PER_MINUTE) {
            log.warn("🚫 Rate limit exceeded (minute): {} - IP: {} - Count: {}",
                    userId != null ? userId : "anonymous", clientIp, minuteCount);

            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Çok fazla istek! Lütfen 1 dakika bekleyin.\"}");
            return false;
        }

        cacheService.set(minuteKey, String.valueOf(minuteCount + 1), 1);

        String hourKey = rateLimitKey + ":hour:" + getCurrentHour();
        int hourCount = getCount(hourKey);

        if (hourCount >= MAX_REQUESTS_PER_HOUR) {
            log.warn("🚫 Rate limit exceeded (hour): {} - IP: {} - Count: {}",
                    userId != null ? userId : "anonymous", clientIp, hourCount);

            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Saatlik limit aşıldı! Lütfen 1 saat bekleyin.\"}");
            return false;
        }

        cacheService.set(hourKey, String.valueOf(hourCount + 1), 60);

        log.debug("✅ Rate limit OK: {} - Minute: {}/{}, Hour: {}/{}",
                clientIp, minuteCount + 1, MAX_REQUESTS_PER_MINUTE, hourCount + 1, MAX_REQUESTS_PER_HOUR);

        return true;
    }

    private int getCount(String key) {
        try {
            Object value = cacheService.get(key);

            if (value == null) {
                return 0;
            }

            if (value instanceof String) {
                return Integer.parseInt((String) value);
            }

            if (value instanceof Integer) {
                return (Integer) value;
            }

            if (value instanceof Long) {
                return ((Long) value).intValue();
            }

            return Integer.parseInt(value.toString());

        } catch (Exception e) {
            log.warn("⚠️ Error parsing count for key {}: {}", key, e.getMessage());
            return 0;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private String getUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("userId");
        return userId != null ? userId.toString() : null;
    }

    private String getCurrentMinute() {
        return String.valueOf(System.currentTimeMillis() / 60000);
    }

    private String getCurrentHour() {
        return String.valueOf(System.currentTimeMillis() / 3600000);
    }
}