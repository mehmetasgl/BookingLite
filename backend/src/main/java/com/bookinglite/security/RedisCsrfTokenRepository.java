package com.bookinglite.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.DefaultCsrfToken;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Custom CSRF Token Repository
 */
@Component
@Slf4j
public class RedisCsrfTokenRepository implements CsrfTokenRepository {

    private static final String CSRF_COOKIE_NAME = "XSRF-TOKEN";
    private static final String CSRF_HEADER_NAME = "X-XSRF-TOKEN";
    private static final String CSRF_PARAMETER_NAME = "_csrf";

    private final com.bookinglite.service.CacheService cacheService;

    public RedisCsrfTokenRepository(com.bookinglite.service.CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @Override
    public CsrfToken generateToken(HttpServletRequest request) {
        String token = UUID.randomUUID().toString();
        log.debug("Generated new CSRF token: {}", token);
        return new DefaultCsrfToken(CSRF_HEADER_NAME, CSRF_PARAMETER_NAME, token);
    }

    @Override
    public void saveToken(CsrfToken token, HttpServletRequest request, HttpServletResponse response) {
        if (token == null) {
            deleteCsrfCookie(response);
            return;
        }

        String sessionId = request.getSession().getId();
        String cacheKey = "csrf:token:" + sessionId;

        cacheService.set(cacheKey, token.getToken(), 60);

        addCsrfCookie(response, token.getToken());
        
        log.debug("Saved CSRF token for session: {}", sessionId);
    }

    @Override
    public CsrfToken loadToken(HttpServletRequest request) {
        String sessionId = request.getSession(false) != null 
            ? request.getSession().getId() 
            : null;

        if (sessionId == null) {
            return null;
        }

        String cacheKey = "csrf:token:" + sessionId;
        Object tokenValue = cacheService.get(cacheKey);

        if (tokenValue != null) {
            log.debug("Loaded CSRF token from Redis for session: {}", sessionId);
            return new DefaultCsrfToken(
                CSRF_HEADER_NAME, 
                CSRF_PARAMETER_NAME, 
                tokenValue.toString()
            );
        }

        return null;
    }

    private void addCsrfCookie(HttpServletResponse response, String token) {
        StringBuilder cookie = new StringBuilder();
        cookie.append(CSRF_COOKIE_NAME).append("=").append(token);
        cookie.append("; Path=/");
        cookie.append("; HttpOnly");
        cookie.append("; SameSite=Strict");

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void deleteCsrfCookie(HttpServletResponse response) {
        StringBuilder cookie = new StringBuilder();
        cookie.append(CSRF_COOKIE_NAME).append("=");
        cookie.append("; Path=/");
        cookie.append("; Max-Age=0");

        response.addHeader("Set-Cookie", cookie.toString());
    }
}
