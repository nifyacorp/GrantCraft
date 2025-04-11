// Auth Types
export interface User {
  id: string;
  name: string | null;
  email: string;
  photoURL: string | null;
  createdAt: string;
}

// Chat Types
export interface Message {
  id: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface ChatSummary {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  userId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  parentTaskId?: string;
  subtasks?: Task[];
}

export interface TaskSummary {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

// File Types
export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  folder?: string;
}

export interface FileSummary {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  tags?: string[];
  folder?: string;
}

// Tool Types
export interface ToolCall {
  id: string;
  type: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  error?: string;
}

export interface Tool {
  name: string;
  description: string;
  icon: string;
  execute: (args: Record<string, any>) => Promise<any>;
} 