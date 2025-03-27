#!/bin/bash
# This script prepares the Next.js application for Cloud Run deployment

# Ensure we're in the Next.js directory
cd "$(dirname "$0")" || exit 1

# Create a production .env file
cat > .env << EOF
# Database connection
DATABASE_URL=mysql://reworkd_platform:Platform_DB_Pass_2025!@34.66.109.248:3306/reworkd_platform

# Next Auth
NEXTAUTH_SECRET=grantcraft_next_auth_secret_2025!
NEXTAUTH_URL=https://grantcraft-frontend-320165158819.us-central1.run.app

# Backend connection
NEXT_PUBLIC_BACKEND_URL=https://grantcraft-backend-320165158819.us-central1.run.app

# Force production mode
NODE_ENV=production
EOF

echo "Created .env file with Cloud Run configuration"

# Export environment variables for build process
export DATABASE_URL="mysql://reworkd_platform:Platform_DB_Pass_2025!@34.66.109.248:3306/reworkd_platform"
export NEXTAUTH_SECRET="grantcraft_next_auth_secret_2025!"
export NEXTAUTH_URL="https://grantcraft-frontend-320165158819.us-central1.run.app"
export NEXT_PUBLIC_BACKEND_URL="https://grantcraft-backend-320165158819.us-central1.run.app"
export NODE_ENV="production"

# Ensure prisma directory exists with a valid schema
mkdir -p prisma
cat > prisma/schema.prisma << EOF
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  name          String?
  email         String?  @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
EOF

echo "Created basic Prisma schema with User model"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application with environment variables properly set
echo "Building Next.js application in production mode..."
NODE_ENV=production npm run build

echo "Build complete. The application is ready for Cloud Run deployment."