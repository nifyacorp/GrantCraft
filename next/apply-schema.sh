#!/bin/bash

# Navigate to the Next.js directory
cd "$(dirname "$0")"

echo "Applying Prisma schema to database..."

# Generate Prisma client
npx prisma generate

# Apply schema to database
npx prisma db push

echo "Schema applied to database. The Account table and other required tables should now exist."