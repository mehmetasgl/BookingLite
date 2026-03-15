package com.bookinglite.security;

import com.bookinglite.entity.User;
import com.bookinglite.repository.UserRepository;
import com.bookinglite.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

/**
 * Refresh Token Service
 * Access Token + Refresh Token Pattern:
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final CacheService cacheService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refresh-token.expiration:604800000}")
    private Long refreshTokenExpiration;

    /**
     * Yeni refresh token oluştur
     */
    public String createRefreshToken(Long userId) {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        String cacheKey = "refresh_token:" + token;
        cacheService.set(cacheKey, userId, refreshTokenExpiration / 60000);

        String userTokensKey = "user_refresh_tokens:" + userId;
        cacheService.set(userTokensKey + ":" + token, token, refreshTokenExpiration / 60000);

        log.info("✅ Refresh token created for user: {}", userId);
        return token;
    }

    /**
     * Refresh token'dan user ID al
     */
    public Optional<Long> getUserIdFromRefreshToken(String refreshToken) {
        String cacheKey = "refresh_token:" + refreshToken;
        Object userId = cacheService.get(cacheKey);

        if (userId != null) {
            return Optional.of(Long.parseLong(userId.toString()));
        }

        return Optional.empty();
    }

    /**
     * Refresh token ile yeni access token al
     */
    public Optional<TokenPair> refreshAccessToken(String refreshToken) {
        Optional<Long> userIdOpt = getUserIdFromRefreshToken(refreshToken);

        if (userIdOpt.isEmpty()) {
            log.warn("⚠️ Invalid or expired refresh token");
            return Optional.empty();
        }

        Long userId = userIdOpt.get();

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || userOpt.get().getStatus() != User.UserStatus.ACTIVE) {
            log.warn("⚠️ User not found or inactive: {}", userId);
            revokeRefreshToken(refreshToken);
            return Optional.empty();
        }

        User user = userOpt.get();

        String newAccessToken = jwtUtil.generateToken(
            user.getId(), 
            user.getEmail(), 
            user.getRole().name()
        );

        String newRefreshToken = createRefreshToken(userId);
        revokeRefreshToken(refreshToken);

        log.info("✅ Token refreshed for user: {}", userId);

        return Optional.of(new TokenPair(newAccessToken, newRefreshToken));
    }

    /**
     * Refresh token'ı iptal et
     */
    public void revokeRefreshToken(String refreshToken) {
        String cacheKey = "refresh_token:" + refreshToken;
        cacheService.delete(cacheKey);

        String blacklistKey = "refresh_token_blacklist:" + refreshToken;
        cacheService.set(blacklistKey, "revoked", refreshTokenExpiration / 60000);

        log.info("✅ Refresh token revoked");
    }

    /**
     * Kullanıcının tüm refresh token'larını iptal et
     */
    public void revokeAllUserRefreshTokens(Long userId) {
        String pattern = "user_refresh_tokens:" + userId + ":*";
        cacheService.deletePattern(pattern);

        log.info("✅ All refresh tokens revoked for user: {}", userId);
    }

    /**
     * Refresh token blacklist'te mi kontrol et
     */
    public boolean isRefreshTokenBlacklisted(String refreshToken) {
        String blacklistKey = "refresh_token_blacklist:" + refreshToken;
        return cacheService.exists(blacklistKey);
    }

    /**
     * Token pair
     */
    public record TokenPair(String accessToken, String refreshToken) {}
}
