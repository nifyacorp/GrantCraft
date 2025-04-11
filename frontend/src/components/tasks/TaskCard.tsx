import React from 'react';
import { MoreHorizontal, Calendar, Flag, ArrowUp, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onStatusChange?: (status: 'todo' | 'in_progress' | 'completed') => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onStatusChange }) => {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3 mr-1 text-red-700" />;
      case 'medium':
        return <ArrowUp className="h-3 w-3 mr-1 text-orange-700" />;
      case 'low':
        return <Flag className="h-3 w-3 mr-1 text-blue-700" />;
      default:
        return <Flag className="h-3 w-3 mr-1 text-gray-700" />;
    }
  };

  const handleStatusChange = (status: 'todo' | 'in_progress' | 'completed') => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  // Calculate if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div 
      className={cn(
        "bg-card border rounded-md p-3 shadow-sm cursor-pointer hover:shadow relative",
        task.priority === 'high' && "border-l-4 border-l-red-500",
        task.priority === 'medium' && "border-l-4 border-l-orange-500",
        task.priority === 'low' && "border-l-4 border-l-blue-500"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{task.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              disabled={task.status === 'todo'}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('todo');
              }}
            >
              To Do
            </DropdownMenuItem>
            <DropdownMenuItem 
              disabled={task.status === 'in_progress'}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('in_progress');
              }}
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem 
              disabled={task.status === 'completed'}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('completed');
              }}
            >
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center mt-3 space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor()} flex items-center`}>
                {getPriorityIcon()}
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Priority: {task.priority}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {task.dueDate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center text-xs rounded px-2 py-1", 
                  isOverdue ? "bg-red-100 text-red-800" : "text-muted-foreground"
                )}>
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOverdue ? "Overdue!" : "Due date"}: {format(new Date(task.dueDate), 'PPP')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Show a small indicator dot for priority at the top right corner */}
      <div 
        className={cn(
          "absolute top-1 right-1 w-2 h-2 rounded-full",
          task.priority === 'high' && "bg-red-500",
          task.priority === 'medium' && "bg-orange-500",
          task.priority === 'low' && "bg-blue-500"
        )}
      />
    </div>
  );
};

export default TaskCard; 