#!/bin/bash

# Test: Einzelnes Profil laden
USER_ID="8ec8cc56-291d-4c7a-b031-6ba123b0f5c6"  # Echte Demo User ID

echo "Testing Single Profile API..."
echo "User ID: $USER_ID"
echo ""

# Prüfe ob jq installiert ist
if command -v jq >/dev/null 2>&1; then
  curl -s "http://localhost:3000/api/people/$USER_ID" | jq .
else
  curl -s "http://localhost:3000/api/people/$USER_ID"
fi

echo ""
echo "✅ If you see profile data above, API works!"
echo "❌ If you see error, check server logs"


