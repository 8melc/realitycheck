#!/bin/bash
# Quick test script for /api/people endpoint
# Usage: ./test-api-people.sh

echo "Testing /api/people endpoint..."
echo ""

# Test with curl
curl -v http://localhost:3000/api/people \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>&1 | tee api-people-response.log

echo ""
echo "Response saved to api-people-response.log"
echo ""
echo "If you see 500 or empty response, check:"
echo "1. Server logs for Supabase errors"
echo "2. RLS policies in Supabase"
echo "3. Whether user_profiles table has data"
