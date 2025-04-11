import apiService from './apiService';
import { Task } from '@/types';

interface CreateTaskParams {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  parentTaskId?: string;
}

interface UpdateTaskParams {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
}

class TaskService {
  private baseEndpoint = '/tasks';

  async getTasks() {
    return apiService.get<Task[]>(this.baseEndpoint);
  }

  async getTaskById(id: string) {
    return apiService.get<Task>(`${this.baseEndpoint}/${id}`);
  }

  async createTask(params: CreateTaskParams) {
    return apiService.post<Task>(this.baseEndpoint, params);
  }

  async updateTask(id: string, params: UpdateTaskParams) {
    return apiService.put<Task>(`${this.baseEndpoint}/${id}`, params);
  }

  async deleteTask(id: string) {
    return apiService.delete(`${this.baseEndpoint}/${id}`);
  }

  async getSubtasks(taskId: string) {
    return apiService.get<Task[]>(`${this.baseEndpoint}/${taskId}/subtasks`);
  }

  async assignTask(taskId: string, userId: string) {
    return apiService.put<Task>(`${this.baseEndpoint}/${taskId}/assign`, { userId });
  }

  async changeStatus(taskId: string, status: 'todo' | 'in_progress' | 'completed') {
    return apiService.put<Task>(`${this.baseEndpoint}/${taskId}/status`, { status });
  }
}

export default new TaskService(); 