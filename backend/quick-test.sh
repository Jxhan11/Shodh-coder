#!/bin/bash

echo "=== Quick Backend Test ==="

BASE_URL="http://localhost:8080"

echo "1. Testing contest endpoint..."
curl -s "$BASE_URL/api/contests/1" | jq '.name' 2>/dev/null || echo "❌ Contest endpoint failed"

echo "2. Testing user creation..."
USER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users?username=quicktest")
USER_ID=$(echo $USER_RESPONSE | jq -r '.id' 2>/dev/null)
echo "Created user ID: $USER_ID"

echo "3. Testing problem details..."
curl -s "$BASE_URL/api/problems/1" | jq '.title' 2>/dev/null || echo "❌ Problem endpoint failed"

echo "4. Testing submission..."
SUBMISSION_DATA='{
    "userId": '$USER_ID',
    "problemId": 2,
    "contestId": 1,
    "language": "python",
    "code": "n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result *= i\nprint(result)"
}'

SUBMISSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/submissions" \
    -H "Content-Type: application/json" \
    -d "$SUBMISSION_DATA")

SUBMISSION_ID=$(echo $SUBMISSION_RESPONSE | jq -r '.id' 2>/dev/null)
echo "Created submission ID: $SUBMISSION_ID"

echo "5. Checking submission status..."
sleep 2
curl -s "$BASE_URL/api/submissions/$SUBMISSION_ID" | jq '.status' 2>/dev/null || echo "❌ Submission status failed"

echo "6. Testing leaderboard..."
curl -s "$BASE_URL/api/contests/1/leaderboard" | jq '.[0].username' 2>/dev/null || echo "❌ Leaderboard failed"

echo "=== Test Complete ===" 