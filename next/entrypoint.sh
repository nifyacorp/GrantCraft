#!/usr/bin/env sh

cd /next
chmod +x /usr/local/bin/wait-for-db.sh
dos2unix /usr/local/bin/wait-for-db.sh

# Log current directory
echo "Current directory: $(pwd)"
echo "Listing files in current directory:"
ls -la

# copy .env file if not exists
[ ! -f .env ] && [ -f .env.example ] && cp .env.example .env
cp .env .env.temp 2>/dev/null || touch .env.temp
dos2unix .env.temp 2>/dev/null || echo "dos2unix failed, continuing anyway"
cat .env.temp > .env 2>/dev/null || echo "Failed to write to .env, creating new one"
rm -f .env.temp

# Set required environment variables if not present in .env
if [ ! -f .env ] || ! grep -q "DATABASE_URL" .env; then
  echo "Creating default .env file"
  cat > .env << EOF
DATABASE_URL=${DATABASE_URL:-mysql://reworkd_platform:reworkd_platform@34.66.109.248:3306/reworkd_platform}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-grantcraft_local_development_secret}
NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-http://localhost:8000}
EOF
fi

# Export environment variables
export DATABASE_URL=${DATABASE_URL:-mysql://reworkd_platform:reworkd_platform@34.66.109.248:3306/reworkd_platform}
export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-grantcraft_local_development_secret}
export NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
export NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-http://localhost:8000}
export SKIP_ENV_VALIDATION=true

# Log all environment variables for debugging
echo "All environment variables for debugging:"
env | sort

echo "Environment variables:"
echo "DATABASE_URL: $DATABASE_URL"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NEXT_PUBLIC_BACKEND_URL: $NEXT_PUBLIC_BACKEND_URL"

# Ensure prisma directory exists
mkdir -p prisma

# Create basic schema.prisma if it doesn't exist
if [ ! -f prisma/schema.prisma ]; then
  echo "Creating basic schema.prisma"
  cat > prisma/schema.prisma << 'EOF'
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
fi

# Generate Prisma client
echo "Generating Prisma client"
npx prisma generate

# Only rebuild if BUILD_ID doesn't exist or if FORCE_REBUILD=true
if [ ! -f ".next/BUILD_ID" ] || [ "$FORCE_REBUILD" = "true" ]; then
  echo "Building application in production mode"
  # Make sure typescript is already installed to avoid downloading during build
  npm list typescript || npm install --no-save typescript
  NODE_ENV=production npm run build
else
  echo "Using existing build (found .next/BUILD_ID)"
fi

# Run the command
echo "Running command: $@"
exec "$@"