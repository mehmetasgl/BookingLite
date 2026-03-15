#!/bin/bash

# RATE LIMITING TEST


echo "🚦 RATE LIMITING TEST"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080/api/v1"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test yapılandırması
MAX_REQUESTS=60
TEST_REQUESTS=70

echo "📊 Yapılandırma:"
echo "   Limit: $MAX_REQUESTS request/minute"
echo "   Test: $TEST_REQUESTS request gönderilecek"
echo ""

SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0
ERROR_COUNT=0

echo "🔄 Test başlıyor..."
echo ""

for i in $(seq 1 $TEST_REQUESTS); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"test"}')
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "400" ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        
        if [ $i -le 5 ] || [ $i -ge 55 ]; then
            echo -e "${GREEN}✅ Request $i: $HTTP_CODE (OK)${NC}"
        elif [ $i -eq 6 ]; then
            echo "..."
        fi
        
    elif [ "$HTTP_CODE" == "429" ]; then
        RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
        
        if [ $RATE_LIMITED_COUNT -le 5 ]; then
            echo -e "${YELLOW}🚫 Request $i: $HTTP_CODE (RATE LIMITED)${NC}"
        elif [ $RATE_LIMITED_COUNT -eq 6 ]; then
            echo "..."
        fi
        
    else
        ERROR_COUNT=$((ERROR_COUNT + 1))
        echo -e "${RED}❌ Request $i: $HTTP_CODE (ERROR)${NC}"
    fi
    
    if [ $i -le 65 ]; then
        sleep 0.05
    fi
done

echo ""
echo "=========================================="
echo "📈 TEST SONUÇLARI:"
echo "=========================================="
echo -e "✅ Başarılı Request: ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "🚫 Rate Limited:     ${YELLOW}$RATE_LIMITED_COUNT${NC}"
echo -e "❌ Hata:             ${RED}$ERROR_COUNT${NC}"
echo "=========================================="
echo ""

# Değerlendirme
if [ $RATE_LIMITED_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ BAŞARILI: Rate Limiting çalışıyor!${NC}"
    echo ""
    echo "📊 Detaylar:"
    echo "   - İlk ~$MAX_REQUESTS request geçti"
    echo "   - Sonraki ${RATE_LIMITED_COUNT} request 429 aldı"
    echo ""
    
    if [ $SUCCESS_COUNT -gt $((MAX_REQUESTS + 10)) ]; then
        echo -e "${YELLOW}⚠️  UYARI: Limit ${MAX_REQUESTS} olmalı ama ${SUCCESS_COUNT} request geçti!${NC}"
        echo "   RateLimitInterceptor.java'da MAX_REQUESTS_PER_MINUTE değerini kontrol edin."
    fi
    
    echo ""
    echo "💡 Rate limit reset için 1 dakika bekleyin:"
    echo "   for i in {60..1}; do echo -ne \"\rKalan: \$i saniye \"; sleep 1; done"
    echo ""
    exit 0
else
    echo -e "${RED}❌ BAŞARISIZ: Rate Limiting çalışmıyor!${NC}"
    echo ""
    echo "🔍 Kontrol Listesi:"
    echo "   1. RateLimitInterceptor.java eklendi mi?"
    echo "      → src/main/java/com/bookinglite/interceptor/RateLimitInterceptor.java"
    echo ""
    echo "   2. WebConfig'de registered mı?"
    echo "      → registry.addInterceptor(rateLimitInterceptor)"
    echo ""
    echo "   3. Redis çalışıyor mu?"
    echo "      → redis-cli ping (PONG dönmeli)"
    echo ""
    echo "   4. CacheService çalışıyor mu?"
    echo "      → Log'larda cache kayıtları var mı?"
    echo ""
    exit 1
fi
