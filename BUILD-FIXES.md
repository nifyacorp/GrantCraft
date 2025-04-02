# GrantCraft Build Fixes

This document outlines the key fixes needed to make GrantCraft build and run properly, with detailed step-by-step instructions.

## 1. Fix Docker Build Issues

### Next.js Frontend Build Fix

The primary Docker build issue is with the frontend container, where the build fails because the `ensure-schema.js` file is needed during the npm install process but isn't available yet. 

**Fix Applied:**
```diff
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

+ # Create minimal prisma directory and ensure-schema.js first
+ RUN mkdir -p prisma
+ COPY prisma/ensure-schema.js ./prisma/

# Modify package.json to remove husky prepare script
RUN grep -v '"prepare":' package.json > package.json.tmp && \
    mv package.json.tmp package.json
```

### Fix Database Connection in Docker Compose

Update docker-compose.yml to ensure the frontend can access the database:

```diff
  frontend:
    container_name: frontend
    build:
      context: ./next
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./next/.env:/next/.env
      - ./next/:/next/
      - /next/node_modules
      - /next/.next
+   environment:
+     DATABASE_URL: mysql://reworkd_platform:reworkd_platform@agentgpt_db:3307/reworkd_platform
+     NEXTAUTH_SECRET: local_development_secret
+     NEXTAUTH_URL: http://localhost:3000
+     NEXT_PUBLIC_BACKEND_URL: http://platform:8000
+   depends_on:
+     - agentgpt_db
```

### Fix entrypoint.sh Default Database URL

Update the entrypoint.sh script to use the docker-compose service name by default:

```diff
-DATABASE_URL=${DATABASE_URL:-mysql://reworkd_platform:reworkd_platform@34.66.109.248:3306/reworkd_platform}
+DATABASE_URL=${DATABASE_URL:-mysql://reworkd_platform:reworkd_platform@agentgpt_db:3307/reworkd_platform}
```

## 2. Local Development Setup

### Create a Development .env File

Create a properly configured `.env` file in the `next` directory:

```
# Database
DATABASE_URL=mysql://reworkd_platform:reworkd_platform@localhost:3308/reworkd_platform

# Next Auth
NEXTAUTH_SECRET=local_development_secret
NEXTAUTH_URL=http://localhost:3000

# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Feature flags
NEXT_PUBLIC_FF_MOCK_MODE_ENABLED=true
NEXT_PUBLIC_FF_AUTH_ENABLED=false
```

### Run the Project

Build and run the project with Docker Compose:

```bash
# Start all services
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

If you encounter database connection issues:
```bash
# Restart services in the correct order
docker-compose down
docker-compose up -d agentgpt_db
# Wait 30 seconds for the database to initialize
docker-compose up -d platform frontend
```

## 3. Environment Variable Configuration

### Required Environment Variables

These environment variables are required for the application to function properly:

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | mysql://reworkd_platform:reworkd_platform@agentgpt_db:3307/reworkd_platform |
| NEXTAUTH_SECRET | Secret for NextAuth | local_development_secret |
| NEXTAUTH_URL | URL for NextAuth | http://localhost:3000 |
| NEXT_PUBLIC_BACKEND_URL | URL for backend API | http://localhost:8000 |

## 4. Build Without Docker

If you want to build without Docker, follow these steps:

### Frontend (Next.js)
```bash
cd next

# Install dependencies
npm install

# Run development server
npm run dev
```

### Backend (FastAPI)
```bash
cd platform

# Install Python dependencies
poetry install

# Run development server
poetry run uvicorn reworkd_platform.__main__:app --reload
```

## 5. Common Issues and Solutions

### Database Connection Fails
- Check that the MySQL container is running
- Ensure the DATABASE_URL environment variable is correct
- Make sure the port mapping is correct in docker-compose.yml

### Missing Environment Variables
- Create a `.env` file in the `next` directory
- Use the example in the "Local Development Setup" section above

### Build Fails with TypeScript Errors
- Run `npm install --save-dev typescript` in the `next` directory
- Check for TypeScript errors with `npm run lint`

### Database Schema Missing
- The application should create a schema automatically
- If not, check the `ensure-schema.js` script is working properly

## Conclusion

By applying these fixes, the GrantCraft project should build and run successfully. The main issues were related to the Docker build process, environment variables, and database configuration.