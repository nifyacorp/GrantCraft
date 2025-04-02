# Database Setup for GrantCraft

## Problem: Missing Account Table

The error "The table `Account` does not exist in the current database" occurs because the NextAuth.js authentication system requires several database tables that weren't included in the original Prisma schema or weren't migrated to the database.

## Solution

1. The Prisma schema has been updated to include all required NextAuth.js tables:
   - `Account`: Stores OAuth account information
   - `Session`: Stores user sessions
   - `User`: Stores user information
   - `VerificationToken`: Used for email verification

2. Database relations have been properly configured:
   - User-to-Account relationship
   - User-to-Session relationship
   - User-to-Agent relationship
   - User-to-Organization relationship

## How to Apply the Fix

Run the provided script to apply the schema to your database:

```bash
cd next
./apply-schema.sh
```

This script will:
1. Generate the Prisma client based on the updated schema
2. Push the schema changes to your database (creating missing tables)

## Verifying the Fix

After running the script, you should be able to:
1. Sign in using OAuth providers (Google, GitHub, Discord)
2. Create and manage agents
3. Access all application features

## Manual Fix (If Needed)

If you need to manually apply the schema:

```bash
cd next
npx prisma generate
npx prisma db push
```

## Important Notes

- This fix assumes your database connection is properly configured in the `.env` file
- The `DATABASE_URL` environment variable must point to a valid MySQL database
- Existing data will be preserved

If you continue to have issues, check your database connection and ensure the MySQL server is running.