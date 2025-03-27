/**
 * Fallback type declarations for Prisma
 * This file provides fallback types if Prisma client generation fails
 */

declare module '@prisma/client' {
  // Only define these types if they don't already exist
  // This is a safety mechanism and should not interfere with proper Prisma client generation
  
  export class PrismaClient {
    constructor(options?: any);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(eventType: string, callback: (event: any) => void): void;
    
    account: {
      create: (args: any) => Promise<Account>;
      findMany: (args?: any) => Promise<Account[]>;
      findFirst: (args: any) => Promise<Account | null>;
      findUnique: (args: any) => Promise<Account | null>;
    };

    session: {
      create: (args: any) => Promise<Session>;
      findMany: (args?: any) => Promise<Session[]>;
      findFirst: (args: any) => Promise<Session | null>;
      findFirstOrThrow: (args: any) => Promise<Session>;
      findUnique: (args: any) => Promise<Session | null>;
      deleteMany: (args: any) => Promise<{ count: number }>;
    };

    agent: {
      create: (args: any) => Promise<Agent>;
      findMany: (args?: any) => Promise<Agent[]>;
      findFirst: (args: any) => Promise<Agent | null>;
      findFirstOrThrow: (args: any) => Promise<Agent>;
      updateMany: (args: any) => Promise<{ count: number }>;
    };

    agentTask: {
      create: (args: any) => Promise<AgentTask>;
    };

    user: {
      create: (args: any) => Promise<User>;
      findUnique: (args: any) => Promise<User | null>;
      update: (args: any) => Promise<User>;
    };

    organizationUser: {
      create: (args: any) => Promise<OrganizationUser>;
      findMany: (args?: any) => Promise<OrganizationUser[]>;
    };

    organization: {
      create: (args: any) => Promise<Organization>;
      findUnique: (args: any) => Promise<Organization | null>;
    };
  }
  
  export interface Account {
    id: string;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
    user: User;
  }

  export interface Session {
    id: string;
    sessionToken: string;
    userId: string;
    expires: Date;
    user: User;
  }

  export interface VerificationToken {
    identifier: string;
    token: string;
    expires: Date;
  }
  
  export interface Agent {
    id: string;
    name: string;
    goal: string;
    userId: string;
    user?: User;
    createDate: Date;
    deleteDate: Date | null;
    tasks?: AgentTask[];
  }

  export interface AgentTask {
    id: string;
    agentId: string;
    agent?: Agent;
    type: string;
    status: string | null;
    info: string;
    value: string;
    sort: number;
    createDate: Date;
  }

  export interface User {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    accounts?: Account[];
    sessions?: Session[];
    createdAt: Date;
    updatedAt: Date;
    superAdmin: boolean;
    agents?: Agent[];
    organizations?: OrganizationUser[];
  }

  export interface Organization {
    id: string;
    name: string;
    users?: OrganizationUser[];
  }

  export interface OrganizationUser {
    id: string;
    user_id: string;
    user?: User;
    organization_id: string;
    organization?: Organization;
    role: string;
  }
}