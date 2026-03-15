#!/bin/bash

echo "🧪 Testing Booking Lite Features..."

# 1. Health Check
echo "1️⃣ Health Check"
curl http://localhost:8080/api/v1/health

# 2. Login & Get Tokens
echo "2️⃣ Login"
RESPONSE=$(curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"12345678"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.data.token')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.data.refreshToken')

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"

# 3. API Call with Token
echo "3️⃣ API Call"
curl http://localhost:8080/api/v1/reservations/my-reservations \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Refresh Token
echo "4️⃣ Refresh Token"
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# 5. Rate Limit Test
echo "5️⃣ Rate Limit Test"
for i in {1..100}; do
  echo "Request $i"
  curl -s -o /dev/null -w "Status: %{http_code}\n" \
    -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@bookinglite.com","password":"admin123"}'
done

echo "✅ All tests completed!"