import { create } from 'zustand';
import { Task, Column, TaskSummary } from '@/types';
import taskService from '@/services/taskService';
import { toast } from '@/lib/hooks/use-toast';

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

interface TaskState {
  tasks: Task[];
  activeTask: Task | null;
  columns: Column[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (params: CreateTaskParams) => Promise<string | null>;
  updateTask: (id: string, params: UpdateTaskParams) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  changeTaskStatus: (taskId: string, status: 'todo' | 'in_progress' | 'completed') => Promise<boolean>;
  assignTask: (taskId: string, userId: string) => Promise<boolean>;
  clearActiveTask: () => void;
  organizeTasksByStatus: () => void;
}

const useTasks = create<TaskState>((set, get) => ({
  tasks: [],
  activeTask: null,
  columns: [
    { id: 'todo', title: 'To Do', taskIds: [] },
    { id: 'in_progress', title: 'In Progress', taskIds: [] },
    { id: 'completed', title: 'Completed', taskIds: [] },
  ],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const response = await taskService.getTasks();
      if (response.error) {
        throw new Error(response.error);
      }
      set({ tasks: response.data || [], loading: false });
      
      // Organize tasks by status
      get().organizeTasksByStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  },

  fetchTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await taskService.getTaskById(id);
      if (response.error) {
        throw new Error(response.error);
      }
      set({ activeTask: response.data || null, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch task';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  },

  createTask: async (params: CreateTaskParams) => {
    set({ loading: true, error: null });
    try {
      const response = await taskService.createTask(params);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        set(state => {
          const newTasks = [...state.tasks, response.data!];
          return { tasks: newTasks, loading: false };
        });
        
        // Re-organize tasks by status
        get().organizeTasksByStatus();
        
        return response.data.id;
      }
      
      set({ loading: false });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  },

  updateTask: async (id: string, params: UpdateTaskParams) => {
    set({ loading: true, error: null });
    try {
      const response = await taskService.updateTask(id, params);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        set(state => {
          const updatedTasks = state.tasks.map(task => 
            task.id === id ? response.data! : task
          );
          
          // Update activeTask if it's the one being updated
          const updatedActiveTask = state.activeTask?.id === id 
            ? response.data 
            : state.activeTask;
          
          return { 
            tasks: updatedTasks, 
            activeTask: updatedActiveTask,
            loading: false 
          };
        });
        
        // Re-organize tasks by status if status has changed
        if (params.status) {
          get().organizeTasksByStatus();
        }
        
        return true;
      }
      
      set({ loading: false });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await taskService.deleteTask(id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      set(state => {
        const updatedTasks = state.tasks.filter(task => task.id !== id);
        
        return { 
          tasks: updatedTasks,
          activeTask: state.activeTask?.id === id ? null : state.activeTask,
          loading: false 
        };
      });
      
      // Re-organize tasks by status
      get().organizeTasksByStatus();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },

  changeTaskStatus: async (taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
    set({ loading: true, error: null });
    try {
      const response = await taskService.changeStatus(taskId, status);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        set(state => {
          const updatedTasks = state.tasks.map(task => 
            task.id === taskId ? { ...task, status } : task
          );
          
          // Update activeTask if it's the one being updated
          const updatedActiveTask = state.activeTask?.id === taskId 
            ? { ...state.activeTask, status } 
            : state.activeTask;
          
          return { 
            tasks: updatedTasks, 
            activeTask: updatedActiveTask,
            loading: false 
          };
        });
        
        // Re-organize tasks by status
        get().organizeTasksByStatus();
        
        return true;
      }
      
      set({ loading: false });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change task status';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },

  assignTask: async (taskId: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await taskService.assignTask(taskId, userId);
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        set(state => {
          const updatedTasks = state.tasks.map(task => 
            task.id === taskId ? { ...task, assignedTo: userId } : task
          );
          
          // Update activeTask if it's the one being updated
          const updatedActiveTask = state.activeTask?.id === taskId 
            ? { ...state.activeTask, assignedTo: userId } 
            : state.activeTask;
          
          return { 
            tasks: updatedTasks, 
            activeTask: updatedActiveTask,
            loading: false 
          };
        });
        
        return true;
      }
      
      set({ loading: false });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign task';
      set({ error: errorMessage, loading: false });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  },

  clearActiveTask: () => {
    set({ activeTask: null });
  },

  organizeTasksByStatus: () => {
    const { tasks } = get();
    
    // Group tasks by status
    const todoTasks = tasks.filter(task => task.status === 'todo').map(task => task.id);
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').map(task => task.id);
    const completedTasks = tasks.filter(task => task.status === 'completed').map(task => task.id);
    
    // Update columns
    set({
      columns: [
        { id: 'todo', title: 'To Do', taskIds: todoTasks },
        { id: 'in_progress', title: 'In Progress', taskIds: inProgressTasks },
        { id: 'completed', title: 'Completed', taskIds: completedTasks },
      ]
    });
  }
}));

export default useTasks; 