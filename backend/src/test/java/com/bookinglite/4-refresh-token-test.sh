#!/bin/bash

# REFRESH TOKEN TEST


echo "🔄 REFRESH TOKEN TEST"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080/api/v1"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test 1: Login ve Token Al
echo -e "${BLUE}TEST 1: Login - Access & Refresh Token Al${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookinglite.com","password":"admin123"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ FAILED: Access token alınamadı!${NC}"
    FAILED=$((FAILED + 1))
    exit 1
else
    echo -e "${GREEN}✅ Access Token: ${ACCESS_TOKEN:0:50}...${NC}"
    PASSED=$((PASSED + 1))
fi

if [ -z "$REFRESH_TOKEN" ]; then
    echo -e "${RED}❌ FAILED: Refresh token alınamadı!${NC}"
    FAILED=$((FAILED + 1))
    exit 1
else
    echo -e "${GREEN}✅ Refresh Token: ${REFRESH_TOKEN:0:50}...${NC}"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 2: Access Token ile API Çağrısı
echo -e "${BLUE}TEST 2: Access Token ile API Çağrısı${NC}"

API_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/hotels" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$API_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$API_RESPONSE" | sed '$d')  # ✅ macOS uyumlu

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASSED: Access token çalışıyor (200 OK)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED: Access token çalışmıyor (HTTP $HTTP_CODE)${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Refresh Token ile Yeni Access Token Al
echo -e "${BLUE}TEST 3: Refresh Token ile Yeni Token Al${NC}"
echo "Request body: {\"refreshToken\":\"${REFRESH_TOKEN:0:30}...\"}"
echo ""

REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

REFRESH_HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n 1)
REFRESH_BODY=$(echo "$REFRESH_RESPONSE" | sed '$d')  # ✅ macOS uyumlu

echo "HTTP Code: $REFRESH_HTTP_CODE"
echo "Response body:"
echo "$REFRESH_BODY" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "$REFRESH_BODY"
echo ""

if [ "$REFRESH_HTTP_CODE" == "200" ]; then
    NEW_ACCESS_TOKEN=$(echo $REFRESH_BODY | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    NEW_REFRESH_TOKEN=$(echo $REFRESH_BODY | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

    if [ -z "$NEW_ACCESS_TOKEN" ]; then
        echo -e "${RED}❌ FAILED: Yeni access token alınamadı!${NC}"
        echo "Response'da 'token' field'ı yok!"
        FAILED=$((FAILED + 1))
    else
        echo -e "${GREEN}✅ PASSED: Yeni access token alındı${NC}"
        echo "   New Token: ${NEW_ACCESS_TOKEN:0:50}..."
        PASSED=$((PASSED + 1))

        if [ "$NEW_REFRESH_TOKEN" != "$REFRESH_TOKEN" ]; then
            echo -e "${GREEN}✅ BONUS: Token rotation çalışıyor (refresh token değişti)${NC}"
        else
            echo -e "${YELLOW}ℹ️  INFO: Refresh token aynı kaldı (rotation yok)${NC}"
        fi
    fi
else
    echo -e "${RED}❌ FAILED: Token yenileme başarısız (HTTP $REFRESH_HTTP_CODE)${NC}"
    echo "Error message: $REFRESH_BODY"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Yeni Access Token ile API Çağrısı
if [ ! -z "$NEW_ACCESS_TOKEN" ]; then
    echo -e "${BLUE}TEST 4: Yeni Access Token ile API Çağrısı${NC}"

    NEW_API_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/hotels" \
      -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

    NEW_HTTP_CODE=$(echo "$NEW_API_RESPONSE" | tail -n 1)

    if [ "$NEW_HTTP_CODE" == "200" ]; then
        echo -e "${GREEN}✅ PASSED: Yeni token çalışıyor (200 OK)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: Yeni token çalışmıyor (HTTP $NEW_HTTP_CODE)${NC}"
        FAILED=$((FAILED + 1))
    fi
    echo ""
fi

# Test 5: Geçersiz Refresh Token
echo -e "${BLUE}TEST 5: Geçersiz Refresh Token${NC}"

INVALID_REFRESH=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"invalid_token_12345"}')

INVALID_HTTP_CODE=$(echo "$INVALID_REFRESH" | tail -n 1)

if [ "$INVALID_HTTP_CODE" == "401" ] || [ "$INVALID_HTTP_CODE" == "400" ]; then
    echo -e "${GREEN}✅ PASSED: Geçersiz token reddedildi (HTTP $INVALID_HTTP_CODE)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED: Geçersiz token kabul edildi! (HTTP $INVALID_HTTP_CODE)${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Logout
echo -e "${BLUE}TEST 6: Logout - Refresh Token İptal${NC}"

LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

LOGOUT_HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n 1)

if [ "$LOGOUT_HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASSED: Logout başarılı (HTTP $LOGOUT_HTTP_CODE)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠️  WARNING: Logout endpoint yok veya çalışmıyor${NC}"
fi
echo ""

# Test 7: Logout Sonrası Refresh Token Kullanımı
if [ "$LOGOUT_HTTP_CODE" == "200" ]; then
    echo -e "${BLUE}TEST 7: Logout Sonrası Token Kullanımı${NC}"

    AFTER_LOGOUT=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/refresh" \
      -H "Content-Type: application/json" \
      -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

    AFTER_LOGOUT_CODE=$(echo "$AFTER_LOGOUT" | tail -n 1)

    if [ "$AFTER_LOGOUT_CODE" == "401" ] || [ "$AFTER_LOGOUT_CODE" == "400" ]; then
        echo -e "${GREEN}✅ PASSED: Logout sonrası token geçersiz (HTTP $AFTER_LOGOUT_CODE)${NC}"
        echo "   Token blacklist çalışıyor!"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: Logout sonrası token hala çalışıyor!${NC}"
        FAILED=$((FAILED + 1))
    fi
    echo ""
fi

# Sonuçlar
echo "=========================================="
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo "=========================================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TÜM REFRESH TOKEN TESTLERI BAŞARILI!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  BAZI TESTLER BAŞARISIZ!${NC}"
    exit 1
fi