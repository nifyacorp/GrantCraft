import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskCard from './TaskCard';
import useTasks from '@/store/taskStore';

interface TaskBoardProps {
  onNewTask?: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ onNewTask }) => {
  const router = useRouter();
  const { tasks, columns, loading, fetchTasks, changeTaskStatus } = useTasks();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleNewTask = () => {
    if (onNewTask) {
      onNewTask();
    }
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    await changeTaskStatus(taskId, newStatus);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={handleNewTask}>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => {
          const columnTasks = tasks.filter(task => task.id && column.taskIds.includes(task.id));
          
          return (
            <div key={column.id} className="bg-muted/40 rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{column.title}</h3>
                <span className="text-sm text-muted-foreground">{columnTasks.length}</span>
              </div>
              
              <div className="space-y-3">
                {columnTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
                ) : (
                  columnTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleTaskClick(task.id)}
                      onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard; 