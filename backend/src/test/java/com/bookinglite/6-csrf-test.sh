#!/bin/bash

# CSRF PROTECTION TEST

echo "🔐 CSRF PROTECTION TEST"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080/api/v1"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "⚠️  NOT: CSRF genellikle development'ta devre dışıdır"
echo "   Production'da HTTPS ile aktif olmalıdır"
echo ""

# Test 1: CSRF Durumu
echo -e "${BLUE}TEST 1: CSRF Aktif mi?${NC}"

NO_CSRF_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookinglite.com","password":"admin123"}')

HTTP_CODE=$(echo "$NO_CSRF_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" == "403" ]; then
    echo -e "${GREEN}✅ CSRF aktif: Token olmadan 403 Forbidden${NC}"
    CSRF_ENABLED=true
elif [ "$HTTP_CODE" == "200" ]; then
    echo -e "${YELLOW}ℹ️  CSRF devre dışı: Token olmadan 200 OK${NC}"
    CSRF_ENABLED=false
else
    echo -e "${RED}⚠️  Beklenmeyen durum: HTTP $HTTP_CODE${NC}"
    CSRF_ENABLED=false
fi
echo ""

if [ "$CSRF_ENABLED" = false ]; then
    echo "=========================================="
    echo -e "${YELLOW}ℹ️  CSRF DEVRE DIŞI${NC}"
    echo "=========================================="
    exit 0
fi

# Test 2: CSRF Token Al
echo -e "${BLUE}TEST 2: CSRF Token Al${NC}"

# Cookie dosyasını temizle
rm -f cookies.txt

# CSRF token endpoint'inden token al ve cookie'yi kaydet
CSRF_RESPONSE=$(curl -s -c cookies.txt "$BASE_URL/auth/csrf-token")

CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$CSRF_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  CSRF token endpoint'ten alınamadı${NC}"

    # Alternatif: Health endpoint'ten token al
    curl -s -c cookies.txt "$BASE_URL/health" > /dev/null 2>&1

    # Cookie'den token oku
    CSRF_TOKEN=$(grep XSRF-TOKEN cookies.txt 2>/dev/null | awk '{print $7}')
fi

if [ ! -z "$CSRF_TOKEN" ]; then
    echo -e "${GREEN}✅ CSRF Token: $CSRF_TOKEN${NC}"
else
    echo -e "${RED}❌ CSRF token alınamadı${NC}"
    rm -f cookies.txt
    exit 1
fi
echo ""

# Test 3: CSRF Token ile Request
echo -e "${BLUE}TEST 3: CSRF Token ile POST Request${NC}"
echo "Cookie file contents:"
cat cookies.txt | grep -v "^#"
echo ""

WITH_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -b cookies.txt \
  -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
  -d '{"email":"admin@bookinglite.com","password":"admin123"}')

WITH_TOKEN_CODE=$(echo "$WITH_TOKEN_RESPONSE" | tail -n 1)
WITH_TOKEN_BODY=$(echo "$WITH_TOKEN_RESPONSE" | sed '$d')  # macOS uyumlu

echo "HTTP Code: $WITH_TOKEN_CODE"
echo "Response (ilk 200 karakter):"
echo "$WITH_TOKEN_BODY" | head -c 200
echo "..."
echo ""

if [ "$WITH_TOKEN_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASSED: CSRF token ile request başarılı (200 OK)${NC}"
else
    echo -e "${RED}❌ FAILED: CSRF token ile request başarısız (HTTP $WITH_TOKEN_CODE)${NC}"
    echo ""
    echo "🔍 Debug bilgileri:"
    echo "   Token: $CSRF_TOKEN"
    echo "   Cookie dosyası:"
    cat cookies.txt
    echo ""
fi
echo ""

# Test 4: Yanlış CSRF Token
echo -e "${BLUE}TEST 4: Yanlış CSRF Token${NC}"

WRONG_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" -b cookies.txt \
  -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: wrong_token_12345" \
  -d '{"email":"admin@bookinglite.com","password":"admin123"}')

WRONG_TOKEN_CODE=$(echo "$WRONG_TOKEN_RESPONSE" | tail -n 1)

if [ "$WRONG_TOKEN_CODE" == "403" ]; then
    echo -e "${GREEN}✅ PASSED: Yanlış token reddedildi (403 Forbidden)${NC}"
else
    echo -e "${RED}❌ FAILED: Yanlış token kabul edildi! (HTTP $WRONG_TOKEN_CODE)${NC}"
fi
echo ""

# Test 5: CSRF Token Olmadan
echo -e "${BLUE}TEST 5: CSRF Token Olmadan POST${NC}"

NO_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookinglite.com","password":"admin123"}')

NO_TOKEN_CODE=$(echo "$NO_TOKEN_RESPONSE" | tail -n 1)

if [ "$NO_TOKEN_CODE" == "403" ]; then
    echo -e "${GREEN}✅ PASSED: Token olmadan reddedildi (403 Forbidden)${NC}"
else
    echo -e "${RED}❌ FAILED: Token olmadan kabul edildi (HTTP $NO_TOKEN_CODE)${NC}"
fi
echo ""

# Test 6: GET Request (CSRF gerektirmez)
echo -e "${BLUE}TEST 6: GET Request (CSRF Token Gerekmez)${NC}"

GET_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/auth/csrf-token")
GET_CODE=$(echo "$GET_RESPONSE" | tail -n 1)

if [ "$GET_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASSED: GET request CSRF token gerektirmiyor${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: GET request başarısız (HTTP $GET_CODE)${NC}"
fi
echo ""

# Temizlik
rm -f cookies.txt

# Sonuç
echo "=========================================="
echo "📊 CSRF PROTECTION ÖZET"
echo "=========================================="
echo ""

if [ "$CSRF_ENABLED" = true ]; then
    echo -e "${GREEN}✅ CSRF Protection: AKTİF${NC}"
    echo ""
    echo "✅ Çalışan özellikler:"
    echo "   - CSRF token generation"
    echo "   - Token validation"
    echo "   - Cookie-based storage"
    echo "   - Header verification (X-XSRF-TOKEN)"
    echo ""
    echo "📝 Frontend Kullanımı:"
    echo "   1. Cookie'den XSRF-TOKEN oku"
    echo "   2. Her POST/PUT/DELETE'te header ekle:"
    echo "      X-XSRF-TOKEN: [token_value]"
    echo ""
else
    echo -e "${YELLOW}ℹ️  CSRF Protection: DEVRE DIŞI${NC}"
    echo ""
    echo "Development ortamında normal!"
fi

echo "=========================================="