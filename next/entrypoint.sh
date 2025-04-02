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
export DATABASE_URL=${DATABASE_URL:-mysql://reworkd_platform:reworkd_platform@agentgpt_db:3307/reworkd_platform}
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
  id              String             @id @default(cuid())
  name            String?
  email           String?            @unique
  emailVerified   DateTime?
  image           String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  agents          Agent[]
  superAdmin      Boolean            @default(false)
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
}

model Agent {
  id          String       @id @default(cuid())
  name        String
  goal        String
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  createDate  DateTime     @default(now())
  deleteDate  DateTime?
  tasks       AgentTask[]
}

model AgentTask {
  id        String   @id @default(cuid())
  agentId   String
  agent     Agent    @relation(fields: [agentId], references: [id])
  type      String
  status    String?
  info      String   @db.Text
  value     String   @db.Text
  sort      Int
  createDate DateTime @default(now())
}

model Organization {
  id            String            @id @default(cuid())
  name          String
  users         OrganizationUser[]
}

model OrganizationUser {
  id              String       @id @default(cuid())
  user_id         String
  organization_id String
  organization    Organization @relation(fields: [organization_id], references: [id])
  role            String
}
EOF
fi

# Generate Prisma client using our robust script
echo "Generating Prisma client with ensure-schema.js"
node prisma/ensure-schema.js

# Create .next directory if it doesn't exist
echo "Ensuring .next directory exists"
mkdir -p .next

# Create a BUILD_ID file if it doesn't exist
if [ ! -f ".next/BUILD_ID" ]; then
  echo "Creating minimal BUILD_ID file"
  echo "$(date +%Y%m%d%H%M%S)" > .next/BUILD_ID
fi

# Always run next build in runtime environment
echo "Building application with runtime environment variables"
# Make sure typescript is already installed to avoid downloading during build
npm list typescript || npm install --no-save typescript
npm run build

# Double check BUILD_ID exists after build
if [ ! -f ".next/BUILD_ID" ]; then
  echo "BUILD_ID still missing after build, creating fallback"
  echo "$(date +%Y%m%d%H%M%S)" > .next/BUILD_ID
fi

# Run the command
echo "Running command: $@"
exec "$@"