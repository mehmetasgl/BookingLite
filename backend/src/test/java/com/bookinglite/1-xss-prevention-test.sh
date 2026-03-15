#!/bin/bash

# ==========================================
# XSS PREVENTION TEST
# ==========================================

echo "🛡️  XSS PREVENTION TEST"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080/api/v1"

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test sonuçları
PASSED=0
FAILED=0

# Login ve Token Al
echo "🔑 Login yapılıyor..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookinglite.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login başarısız! Token alınamadı.${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Token alındı${NC}"
echo ""

# Test 1: Script Tag Injection
echo -e "${BLUE}TEST 1: Script Tag Injection${NC}"
echo "Payload: <script>alert('XSS')</script>Hotel Name"

RESPONSE_1=$(curl -s -X POST "$BASE_URL/hotels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert('\''XSS'\'')</script>Hotel Name",
    "description": "Test Description",
    "city": "Istanbul",
    "address": "Test Address",
    "checkinTime": "14:00:00",
    "checkoutTime": "12:00:00"
  }')

HOTEL_NAME=$(echo $RESPONSE_1 | grep -o '"name":"[^"]*' | cut -d'"' -f4)

if [[ "$HOTEL_NAME" == *"<script>"* ]]; then
    echo -e "${RED}❌ FAILED: Script tag not sanitized!${NC}"
    echo "Response name: $HOTEL_NAME"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ PASSED: Script tag removed${NC}"
    echo "Cleaned name: $HOTEL_NAME"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 2: HTML Event Handler Injection
echo -e "${BLUE}TEST 2: HTML Event Handler (onclick)${NC}"
echo "Payload: <img src=x onerror=alert('XSS')>"

RESPONSE_2=$(curl -s -X POST "$BASE_URL/hotels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Normal Hotel",
    "description": "<img src=x onerror=alert('\''XSS'\'')>",
    "city": "Ankara",
    "address": "Test Address",
    "checkinTime": "14:00:00",
    "checkoutTime": "12:00:00"
  }')

DESC=$(echo $RESPONSE_2 | grep -o '"description":"[^"]*' | cut -d'"' -f4)

if [[ "$DESC" == *"onerror"* ]]; then
    echo -e "${RED}❌ FAILED: Event handler not sanitized!${NC}"
    echo "Description: $DESC"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ PASSED: Event handler removed${NC}"
    echo "Cleaned description: $DESC"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 3: Iframe Injection
echo -e "${BLUE}TEST 3: Iframe Injection${NC}"
echo "Payload: <iframe src='http://evil.com'></iframe>"

RESPONSE_3=$(curl -s -X POST "$BASE_URL/hotels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hotel",
    "description": "<iframe src='\''http://evil.com'\''></iframe>Normal text",
    "city": "Izmir",
    "address": "Test Address",
    "checkinTime": "14:00:00",
    "checkoutTime": "12:00:00"
  }')

DESC_3=$(echo $RESPONSE_3 | grep -o '"description":"[^"]*' | cut -d'"' -f4)

if [[ "$DESC_3" == *"<iframe"* ]]; then
    echo -e "${RED}❌ FAILED: Iframe not sanitized!${NC}"
    echo "Description: $DESC_3"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ PASSED: Iframe removed${NC}"
    echo "Cleaned description: $DESC_3"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 4: SQL Injection Attempt (should be handled by JPA)
echo -e "${BLUE}TEST 4: SQL Injection in Input${NC}"
echo "Payload: '; DROP TABLE hotels; --"

RESPONSE_4=$(curl -s -X POST "$BASE_URL/hotels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel'\''; DROP TABLE hotels; --",
    "description": "Normal Description",
    "city": "Bursa",
    "address": "Test Address",
    "checkinTime": "14:00:00",
    "checkoutTime": "12:00:00"
  }')

# Check if hotels table still exists by trying to fetch hotels
CHECK_HOTELS=$(curl -s "$BASE_URL/hotels" \
  -H "Authorization: Bearer $TOKEN")

if [[ "$CHECK_HOTELS" == *"success"* ]]; then
    echo -e "${GREEN}✅ PASSED: SQL Injection prevented (hotels table exists)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED: Possible SQL Injection!${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: JavaScript Protocol
echo -e "${BLUE}TEST 5: JavaScript Protocol in Address${NC}"
echo "Payload: javascript:alert('XSS')"

RESPONSE_5=$(curl -s -X POST "$BASE_URL/hotels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hotel",
    "description": "Description",
    "city": "Antalya",
    "address": "javascript:alert('\''XSS'\'')",
    "checkinTime": "14:00:00",
    "checkoutTime": "12:00:00"
  }')

ADDRESS=$(echo $RESPONSE_5 | grep -o '"address":"[^"]*' | cut -d'"' -f4)

if [[ "$ADDRESS" == *"javascript:"* ]]; then
    echo -e "${RED}❌ FAILED: JavaScript protocol not sanitized!${NC}"
    echo "Address: $ADDRESS"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✅ PASSED: JavaScript protocol removed${NC}"
    echo "Cleaned address: $ADDRESS"
    PASSED=$((PASSED + 1))
fi
echo ""

# Test 6: Basic HTML Tags (Should Allow Safe Tags)
echo -e "${BLUE}TEST 6: Safe HTML Tags (bold, italic)${NC}"
echo "Payload: Normal <b>bold</b> and <i>italic</i> text"

RESPONSE_6=$(curl -s -X POST "$BASE_URL/hotels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hotel",
    "description": "Normal <b>bold</b> and <i>italic</i> text",
    "city": "Bodrum",
    "address": "Test Address",
    "checkinTime": "14:00:00",
    "checkoutTime": "12:00:00"
  }')

DESC_6=$(echo $RESPONSE_6 | grep -o '"description":"[^"]*' | cut -d'"' -f4)

echo "Description: $DESC_6"
if [[ "$DESC_6" == *"bold"* ]] && [[ "$DESC_6" == *"italic"* ]]; then
    echo -e "${YELLOW}⚠️  INFO: Safe HTML tags present (depends on config)${NC}"
else
    echo -e "${BLUE}ℹ️  INFO: All HTML stripped (maximum security)${NC}"
fi
echo ""

# Sonuçlar
echo "=========================================="
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TÜM XSS TESTLERI BAŞARILI!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  BAZI TESTLER BAŞARISIZ!${NC}"
    echo "XssPreventionService.java dosyasını kontrol edin."
    exit 1
fi
