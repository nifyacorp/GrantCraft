#!/bin/bash

# All-in-one database fix and test script
# This script will:
# 1. Apply the Prisma schema to the database
# 2. Run the database tests to verify the fix
# 3. Provide a summary of the results

echo "=== GrantCraft Database Fix and Test Script ==="
echo "=============================================="
echo ""

# Step 1: Apply the Prisma schema
echo "Step 1: Applying Prisma schema to database..."
echo "--------------------------------------------"
cd "$(dirname "$0")/next"
chmod +x ./apply-schema.sh
./apply-schema.sh
SCHEMA_RESULT=$?

echo ""
echo "Step 2: Testing database configuration..."
echo "----------------------------------------"
cd "../test"
npm install axios chalk > /dev/null
./run-db-tests.sh
TEST_RESULT=$?

echo ""
echo "=== Summary ==="
echo "--------------"
if [ $SCHEMA_RESULT -eq 0 ] && [ $TEST_RESULT -eq 0 ]; then
  echo "✅ SUCCESS: Database schema applied and tests passed!"
  echo "You should now be able to use OAuth login with Google, GitHub, etc."
elif [ $SCHEMA_RESULT -ne 0 ]; then
  echo "❌ ERROR: Failed to apply database schema."
  echo "Check the error messages above for more details."
  echo "Verify your DATABASE_URL environment variable is correct."
elif [ $TEST_RESULT -ne 0 ]; then
  echo "❌ ERROR: Database tests failed after schema was applied."
  echo "Check database-report.json for detailed diagnostic information."
  echo "You may need to restart the backend service."
fi

echo ""
echo "See DATABASE-TESTING.md and DATABASE-SETUP.md for more information."
echo ""