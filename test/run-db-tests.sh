#!/bin/bash

# Run database tests with different backend URLs

echo "=== Testing with localhost:8000 ==="
echo "--------------------------------"
API_BASE_URL=http://localhost:8000/api node db-test.js

if [ $? -ne 0 ]; then
  echo ""
  echo "=== Testing with production backend ==="
  echo "--------------------------------"
  API_BASE_URL=https://grantcraft-backend-320165158819.us-central1.run.app/api node db-test.js
fi

echo ""
echo "Tests completed. Check database-report.json for detailed results."