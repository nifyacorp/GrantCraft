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

# Create default .env with DATABASE_URL if needed
if [ ! -f .env ] || ! grep -q "DATABASE_URL" .env; then
  echo "Creating/updating .env with DATABASE_URL"
  echo "DATABASE_URL=${DATABASE_URL:-mysql://reworkd_platform:reworkd_platform@34.66.109.248:3306/reworkd_platform}" > .env
fi

source .env || echo "Failed to source .env, continuing anyway"

echo "DATABASE_URL: $DATABASE_URL"

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

# Wait for database to be available
if echo "$DATABASE_URL" | grep -q "mysql"; then
  echo "Waiting for MySQL database..."
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's/mysql:\/\/[^:]+:[^@]+@([^:]+):.*/\1/')
  DB_PORT=$(echo "$DATABASE_URL" | sed -E 's/mysql:\/\/[^:]+:[^@]+@[^:]+:([0-9]+)\/.*/\1/')
  
  echo "Checking connection to $DB_HOST:$DB_PORT"
  for i in $(seq 1 30); do
    nc -z -w 1 "$DB_HOST" "$DB_PORT" && break
    echo "Waiting for database connection... ($i/30)"
    sleep 2
  done
fi

# Ensure Prisma is installed
npm ls prisma || npm install -g prisma

# Generate Prisma client (always do this)
echo "Generating Prisma client"
# Add debug information for Prisma schema
echo "Contents of prisma/schema.prisma:"
cat prisma/schema.prisma

# Run Prisma generate with error handling
npx prisma generate || {
  echo "Prisma generate failed, checking and fixing issues..."
  # Make sure there's at least one model in the schema
  if ! grep -q "model" prisma/schema.prisma; then
    echo "No models found in schema.prisma, adding User model"
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
    # Try generating again
    npx prisma generate || echo "Prisma generate still failed, continuing anyway..."
  fi
}

# If database is available, try migrations
if echo "$DATABASE_URL" | grep -q "mysql"; then
  echo "Pushing schema to database"
  npx prisma db push --skip-generate --accept-data-loss || echo "Database push failed, continuing anyway"
fi

# Force production mode for Cloud Run
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=production
fi

# Check if .next/BUILD_ID exists, if not, run build
if [ ! -f ".next/BUILD_ID" ]; then
  echo "BUILD_ID not found. Running build process..."
  npm run build
fi

# For Cloud Run, always run in production mode instead of development
if [ "$1" = "npm" ] && [ "$2" = "run" ] && [ "$3" = "dev" ]; then
  echo "Forcing 'npm run start' instead of 'npm run dev' for Cloud Run"
  exec npm run start
else
  # run original command
  echo "Running command: $@"
  exec "$@"
fi