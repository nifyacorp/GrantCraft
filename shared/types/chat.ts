/**
 * Chat-related type definitions shared between frontend and backend
 */

/**
 * Chat model
 */
export interface Chat {
  id: string;
  projectId: string;
  title: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * Message model
 */
export interface Message {
  id: string;
  chatId: string;
  content: string;
  role: MessageRole;
  timestamp: string; // ISO date string
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

/**
 * Message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Tool call model
 */
export interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  status: ToolCallStatus;
}

/**
 * Tool call status
 */
export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Tool result model
 */
export interface ToolResult {
  toolCallId: string;
  result: any;
  error?: string;
}

/**
 * Create chat request
 */
export interface CreateChatRequest {
  projectId: string;
  title: string;
}

/**
 * Create message request
 */
export interface CreateMessageRequest {
  chatId: string;
  content: string;
  role: MessageRole;
} 