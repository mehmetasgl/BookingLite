#!/bin/bash

# I18N Test Script

echo "🌍 I18N (Multi-Language) Test Başlıyor..."
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080/api/v1"

# Renkler
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Türkçe (TR)
echo -e "${BLUE}🇹🇷 TEST 1: Türkçe (TR)${NC}"
echo "Request: Accept-Language: tr"
echo ""

RESPONSE_TR=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Accept-Language: tr" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}')

echo "Response:"
echo "$RESPONSE_TR" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_TR"
echo ""
echo "Beklenen mesaj: 'Email veya şifre hatalı'"
echo "---"
echo ""

# Test 2: İngilizce (EN)
echo -e "${BLUE}🇬🇧 TEST 2: İngilizce (EN)${NC}"
echo "Request: Accept-Language: en"
echo ""

RESPONSE_EN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Accept-Language: en" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}')

echo "Response:"
echo "$RESPONSE_EN" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_EN"
echo ""
echo "Beklenen mesaj: 'Email or password is incorrect'"
echo "---"
echo ""

# Test 3: Almanca (DE)
echo -e "${BLUE}🇩🇪 TEST 3: Almanca (DE)${NC}"
echo "Request: Accept-Language: de"
echo ""

RESPONSE_DE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Accept-Language: de" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}')

echo "Response:"
echo "$RESPONSE_DE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_DE"
echo ""
echo "Beklenen mesaj: 'E-Mail oder Passwort ist falsch'"
echo "---"
echo ""

# Test 4: Fransızca (FR)
echo -e "${BLUE}🇫🇷 TEST 4: Fransızca (FR)${NC}"
echo "Request: Accept-Language: fr"
echo ""

RESPONSE_FR=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Accept-Language: fr" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}')

echo "Response:"
echo "$RESPONSE_FR" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_FR"
echo ""
echo "Beklenen mesaj: 'Email ou mot de passe incorrect'"
echo "---"
echo ""

# Test 5: Query Parameter (?lang=tr)
echo -e "${BLUE}🔗 TEST 5: Query Parameter (?lang=tr)${NC}"
echo "Request: ?lang=tr"
echo ""

RESPONSE_QUERY=$(curl -s -X POST "$BASE_URL/auth/login?lang=tr" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}')

echo "Response:"
echo "$RESPONSE_QUERY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_QUERY"
echo ""
echo "Beklenen mesaj: 'Email veya şifre hatalı'"
echo "---"
echo ""

# Test 6: Başarılı Login (TR)
echo -e "${GREEN}✅ TEST 6: Başarılı Login (TR)${NC}"
echo "Request: Accept-Language: tr"
echo ""

RESPONSE_SUCCESS_TR=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Accept-Language: tr" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookinglite.com","password":"admin123"}')

echo "Response (ilk 500 karakter):"
echo "$RESPONSE_SUCCESS_TR" | head -c 500
echo "..."
echo ""
echo "Beklenen mesaj: 'Giriş başarılı! Hoş geldiniz 👋'"
echo "---"
echo ""

# Test 7: Başarılı Login (EN)
echo -e "${GREEN}✅ TEST 7: Başarılı Login (EN)${NC}"
echo "Request: Accept-Language: en"
echo ""

RESPONSE_SUCCESS_EN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Accept-Language: en" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookinglite.com","password":"admin123"}')

echo "Response (ilk 500 karakter):"
echo "$RESPONSE_SUCCESS_EN" | head -c 500
echo "..."
echo ""
echo "Beklenen mesaj: 'Login successful! Welcome back 👋'"
echo "---"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ I18N Testleri Tamamlandı!${NC}"
echo ""
echo "💡 Manuel Test:"
echo "   Swagger UI → Accept-Language header ekle"
echo "   Postman → Headers → Accept-Language: tr"
