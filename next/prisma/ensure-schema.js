/**
 * This script ensures that the Prisma schema is valid and generates the client
 * It's a safety fallback for build environments where the normal generation might fail
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCHEMA_PATH = path.join(__dirname, 'schema.prisma');

// Minimal schema with just what we need for the app to function
const MINIMAL_SCHEMA = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String   @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id               String             @id @default(cuid())
  name             String?
  email            String?            @unique
  emailVerified    DateTime?
  image            String?
  accounts         Account[]
  sessions         Session[]
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  agents           Agent[]
  superAdmin       Boolean            @default(false)
  organizations    OrganizationUser[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
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
  user            User         @relation(fields: [user_id], references: [id])
  organization_id String
  organization    Organization @relation(fields: [organization_id], references: [id])
  role            String
}`;

// Check if schema file exists, if not create it with minimal schema
if (!fs.existsSync(SCHEMA_PATH)) {
  console.log('Prisma schema not found, creating minimal schema');
  fs.writeFileSync(SCHEMA_PATH, MINIMAL_SCHEMA);
}

// Read current schema
const currentSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');

// Check if schema has the Agent model
if (!currentSchema.includes('model Agent')) {
  console.warn('Schema does not contain the Agent model, replacing with complete schema');
  fs.writeFileSync(SCHEMA_PATH, MINIMAL_SCHEMA);
}

// Run prisma generate with error handling
try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully');
} catch (error) {
  console.error('Error generating Prisma client:', error.message);
  
  // Try again with minimal schema
  console.log('Retrying with minimal schema...');
  fs.writeFileSync(SCHEMA_PATH, MINIMAL_SCHEMA);
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma client generated successfully with minimal schema');
  } catch (retryError) {
    console.error('Failed to generate Prisma client even with minimal schema:', retryError.message);
    console.log('Application will rely on fallback type definitions');
  }
}

// Verify the generated client
const clientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client', 'index.d.ts');
if (fs.existsSync(clientPath)) {
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  if (!clientContent.includes('export type Agent')) {
    console.warn('Generated client does not contain the Agent type');
  } else {
    console.log('Agent type found in generated client');
  }
} else {
  console.warn('Prisma client does not exist at expected path:', clientPath);
}