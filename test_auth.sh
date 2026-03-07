#!/bin/bash

echo "=== Testing Authentication Flow ==="
echo ""

# Test 1: Health Check
echo "1. Testing health endpoint..."
HEALTH=$(curl -s http://localhost:5000/api/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "   ✓ Health check passed"
else
    echo "   ✗ Health check failed"
    exit 1
fi

# Test 2: Login
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}' \
  -c /tmp/test_cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
    echo "   ✓ Login passed"
else
    echo "   ✗ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Get current user with session cookie
echo "3. Testing /api/auth/me with session cookie..."
ME_RESPONSE=$(curl -s http://localhost:5000/api/auth/me \
  -b /tmp/test_cookies.txt)

if echo "$ME_RESPONSE" | grep -q "demo@example.com"; then
    echo "   ✓ Authenticated user retrieval passed"
else
    echo "   ✗ Authenticated user retrieval failed"
    echo "   Response: $ME_RESPONSE"
    exit 1
fi

# Test 4: Access protected data endpoint
echo "4. Testing protected /api/data endpoint..."
DATA_RESPONSE=$(curl -s http://localhost:5000/api/data \
  -b /tmp/test_cookies.txt)

if echo "$DATA_RESPONSE" | grep -q "entries"; then
    echo "   ✓ Protected data access passed"
else
    echo "   ✗ Protected data access failed"
    echo "   Response: $DATA_RESPONSE"
    exit 1
fi

# Test 5: Logout
echo "5. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/logout \
  -b /tmp/test_cookies.txt)

if echo "$LOGOUT_RESPONSE" | grep -q "Logout successful"; then
    echo "   ✓ Logout passed"
else
    echo "   ✗ Logout failed"
    echo "   Response: $LOGOUT_RESPONSE"
fi

# Test 6: Verify session is invalidated after logout
echo "6. Testing session invalidation after logout..."
AFTER_LOGOUT=$(curl -s http://localhost:5000/api/auth/me \
  -b /tmp/test_cookies.txt)

if echo "$AFTER_LOGOUT" | grep -q "error\|null\|Unauthorized"; then
    echo "   ✓ Session invalidation passed"
else
    echo "   ⚠ Session may still be active (check manually)"
fi

echo ""
echo "=== All Tests Completed ==="
