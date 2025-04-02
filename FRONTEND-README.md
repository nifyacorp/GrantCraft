# GrantCraft Frontend

This is the frontend application for GrantCraft, built with Next.js and TypeScript.

## Technology Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database ORM**: Prisma
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- A MySQL database

### Setting Up the Environment

1. Clone the repository and navigate to the frontend directory:

```bash
cd next
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file to add your database connection string:

```
DATABASE_URL=mysql://username:password@hostname:port/database
```

4. Apply the database schema:

```bash
./apply-schema.sh
# or
npx prisma db push
```

### Development Server

Run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Authentication Configuration

### Login Bypass (Development Only)

For development purposes, you can use a special bypass username:

1. Go to the sign-in page
2. Enter "ratonxi" as the username
3. Click "Sign in with username (Insecure)"

This will bypass authentication and redirect you to the main page.

### Google OAuth Configuration

To enable Google OAuth authentication:

1. Create OAuth credentials in the Google Cloud Console
2. Add the credentials to your `.env` file:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_VERCEL_ENV=production
```

## Database Issues

If you encounter the error "The table `Account` does not exist in the current database", you need to apply the Prisma schema:

```bash
./apply-schema.sh
# or
npx prisma db push
```

This will create all the necessary tables for NextAuth.js to function.

## Docker Deployment

Build the Docker image:

```bash
docker build -t grantcraft-frontend .
```

Run the container:

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://username:password@hostname:port/database \
  grantcraft-frontend
```

## Troubleshooting

### Database Connection Issues

Verify your database connection with:

```bash
npx prisma db pull
```

### Authentication Problems

Check the NextAuth.js logs in your browser console or server logs. Common issues include:

- Missing database tables (fix with `npx prisma db push`)
- Incorrect OAuth credentials
- Invalid redirect URLs

## Directory Structure

- `/prisma`: Database schema and migrations
- `/public`: Static assets
- `/src/components`: UI components
- `/src/pages`: Page components
- `/src/server`: Backend API routes
- `/src/styles`: Global styles
- `/src/utils`: Utility functions