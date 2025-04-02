# Docker Build Issues and Solutions

## Current Build Error
When building the Docker image, the following error occurs:
```
Error: Cannot find module '/next/prisma/ensure-schema.js'
```

This happens because the Dockerfile attempts to run `npm run prisma:ensure` which executes the `prisma/ensure-schema.js` script, but at that point in the Dockerfile the script hasn't been copied to the container yet.

## Root Causes

1. **Improper Build Sequence**:
   - The Dockerfile copies only package*.json files
   - Runs npm ci which tries to execute postinstall script
   - The postinstall script tries to run ensure-schema.js which doesn't exist yet
   - Only later does the Dockerfile copy the rest of the application files

2. **Circular Dependencies**:
   - The package.json postinstall script depends on prisma/ensure-schema.js
   - The build process needs npm installed before copying all files

## Solutions

### 1. Fix Dockerfile Build Sequence

Modify the Dockerfile to copy the prisma directory before running npm ci:

```dockerfile
# Set the working directory
WORKDIR /next

# Copy package.json, package-lock.json and critical scripts first
COPY package*.json ./
COPY prisma/ensure-schema.js ./prisma/

# Modify package.json to remove husky prepare script that tries to access parent directory
RUN grep -v '"prepare":' package.json > package.json.tmp && \
    mv package.json.tmp package.json

# Install dependencies including TypeScript
RUN npm ci && npm install --save-dev typescript
```

### 2. Temporarily Disable Postinstall Script

Alternatively, modify the Dockerfile to temporarily disable the postinstall script:

```dockerfile
# Set the working directory
WORKDIR /next

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Temporarily remove postinstall script
RUN sed -i 's/"postinstall": "npm run prisma:ensure",/"postinstall": "echo Skipping postinstall during build",/g' package.json

# Install dependencies including TypeScript
RUN npm ci && npm install --save-dev typescript

# Copy the rest of the application code
COPY . .

# Restore original postinstall script
RUN sed -i 's/"postinstall": "echo Skipping postinstall during build",/"postinstall": "npm run prisma:ensure",/g' package.json
```

### 3. Create Empty ensure-schema.js Before npm ci

Another approach is to create a minimal ensure-schema.js file before running npm ci:

```dockerfile
# Set the working directory
WORKDIR /next

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Create minimal prisma directory and ensure-schema.js
RUN mkdir -p prisma && \
    echo "console.log('Placeholder ensure-schema.js during build');" > prisma/ensure-schema.js

# Install dependencies
RUN npm ci && npm install --save-dev typescript

# Now copy the real application code
COPY . .
```

## Additional Docker Issues

1. **Database Connection Issues**:
   - The default DATABASE_URL in entrypoint.sh points to 34.66.109.248:3306, which may not be accessible
   - Consider using docker-compose service name instead for local development

2. **Environment Variables**:
   - Environment variables in entrypoint.sh may not match what the application expects
   - Review all required environment variables

3. **Docker Compose Configuration**:
   - Ensure proper wait mechanisms for the database to be ready before starting the application
   - Check network configuration to ensure services can communicate

## Testing the Build Locally

To test the Docker build locally with the fixes:

1. Apply one of the solutions above to the Dockerfile
2. Run: `docker build -t grantcraft-next ./next`
3. Run with proper environment variables:
   ```
   docker run -p 3000:3000 \
     -e DATABASE_URL=mysql://user:password@host:3306/database \
     -e NEXTAUTH_URL=http://localhost:3000 \
     -e NEXTAUTH_SECRET=local_dev_secret \
     -e NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 \
     grantcraft-next
   ```