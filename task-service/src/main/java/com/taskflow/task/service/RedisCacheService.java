package com.taskflow.task.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RedisCacheService {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    public void cacheValue(String key, String value, long timeoutSeconds) {
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, value, timeoutSeconds, TimeUnit.SECONDS);
            } catch (Exception ignored) {
            }
        }
    }

    public String getCachedValue(String key) {
        if (redisTemplate != null) {
            try {
                return redisTemplate.opsForValue().get(key);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    public void evictCache(String key) {
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(key);
            } catch (Exception ignored) {
            }
        }
    }
}
