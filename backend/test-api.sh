#!/bin/bash

API_URL="http://localhost:5000"

echo "Testing Sikars API..."
echo ""

echo "1. Health Check:"
curl -s "$API_URL/health"
echo ""

echo "2. Get Products:"
curl -s "$API_URL/api/products/sizes"
echo ""

echo "3. Register User:"
curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }' 
