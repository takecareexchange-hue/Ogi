#!/bin/bash

PRACTICE_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"
PAYLOAD='{"patient_name": "John Doe", "symptoms": ["fatigue", "muscle loss"], "goals": ["weight loss", "muscle gain"]}'

echo "Sending webhook request..."
curl -X POST "http://localhost:3001/api/v1/ingest/webhook/$PRACTICE_ID" \
     -H "Content-Type: application/json" \
     -d "$PAYLOAD"

echo -e "\n\nChecking database for new intake..."
team-db "SELECT * FROM intakes ORDER BY created_at DESC LIMIT 1"
