# Use the official Node.js image as the base image
FROM node:18-alpine

ARG NODE_ENV=production

ENV NODE_ENV=$NODE_ENV

# Install OpenSSL and other dependencies
RUN apk add --no-cache openssl netcat-openbsd dos2unix

# Set the working directory
WORKDIR /next

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Modify package.json to remove husky prepare script that tries to access parent directory
RUN grep -v '"prepare":' package.json > package.json.tmp && \
    mv package.json.tmp package.json

# Install dependencies including TypeScript
RUN npm ci && npm install --save-dev typescript

# Copy the wait-for-db.sh script
COPY wait-for-db.sh /usr/local/bin/wait-for-db.sh
RUN chmod +x /usr/local/bin/wait-for-db.sh

# Copy the rest of the application code
COPY . .
COPY entrypoint.sh /

# Ensure correct line endings
RUN dos2unix /entrypoint.sh

# Create prisma directory and basic schema if it doesn't exist
RUN mkdir -p prisma && \
    if [ ! -f prisma/schema.prisma ]; then \
      printf "generator client {\n  provider = \"prisma-client-js\"\n}\n\ndatasource db {\n  provider = \"mysql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id            String   @id @default(cuid())\n  name          String?\n  email         String?  @unique\n  emailVerified DateTime?\n  image         String?\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n}\n" > prisma/schema.prisma; \
    fi

# Build the application during image creation
RUN mkdir -p .next && \
    # Pre-install TypeScript to avoid download during build
    npm install --no-save typescript && \
    npm run build

# Expose the port the app will run on
EXPOSE 3000

ENTRYPOINT ["sh", "/entrypoint.sh"]

# Start the application
CMD ["npm", "run", "start"]