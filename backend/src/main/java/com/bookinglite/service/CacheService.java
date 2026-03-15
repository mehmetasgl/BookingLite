package com.bookinglite.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * CacheService - Redis cache operasyonları
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final RedisTemplate<String, Object> redisTemplate;

    public void set(String key, Object value, long ttlMinutes) {
        try {
            redisTemplate.opsForValue().set(key, value, ttlMinutes, TimeUnit.MINUTES);
            log.info("✅ Cache saved: {}", key);
        } catch (Exception e) {
            log.error("❌ Cache save error: {}", e.getMessage());
        }
    }
    public Object get(String key) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                log.info("✅ Cache hit: {}", key);
            } else {
                log.info("❌ Cache miss: {}", key);
            }
            return value;
        } catch (Exception e) {
            log.error("❌ Cache read error: {}", e.getMessage());
            return null;
        }
    }
    public void delete(String key) {
        try {
            redisTemplate.delete(key);
            log.info("✅ Cache deleted: {}", key);
        } catch (Exception e) {
            log.error("❌ Cache delete error: {}", e.getMessage());
        }
    }

    public void deletePattern(String pattern) {
        try {
            var keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("✅ Cache pattern deleted: {} ({} keys)", pattern, keys.size());
            }
        } catch (Exception e) {
            log.error("❌ Cache pattern delete error: {}", e.getMessage());
        }
    }

    public boolean exists(String key) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("❌ Cache exists check error: {}", e.getMessage());
            return false;
        }
    }

    public void expire(String key, long ttlMinutes) {
        try {
            redisTemplate.expire(key, ttlMinutes, TimeUnit.MINUTES);
            log.info("✅ Cache TTL updated: {}", key);
        } catch (Exception e) {
            log.error("❌ Cache TTL update error: {}", e.getMessage());
        }
    }
}
