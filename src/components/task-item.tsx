'use client';

import type { Task, TaskStatus } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  CalendarIcon,
  Check,
  Edit,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type TaskItemProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
};

const statusColors: Record<TaskStatus, string> = {
  'To Do': 'bg-gray-500 hover:bg-gray-600',
  'In Progress': 'bg-blue-500 hover:bg-blue-600',
  Completed: 'bg-primary hover:bg-primary/90',
};

export default function TaskItem({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskItemProps) {
  const isCompleted = task.status === 'Completed';

  const handleQuickComplete = () => {
    onStatusChange(task, isCompleted ? 'To Do' : 'Completed');
  };

  return (
    <Card className={cn('flex flex-col transition-all hover:shadow-md', isCompleted && 'bg-muted/60')}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className={cn("text-lg", isCompleted && "line-through text-muted-foreground")}>{task.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={isCompleted ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={handleQuickComplete}
              aria-label={isCompleted ? 'Mark as not completed' : 'Mark as completed'}
            >
              <Check className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription
          className={cn(
            'line-clamp-3 text-sm',
            isCompleted && 'text-muted-foreground/80'
          )}
        >
          {task.description || 'No description provided.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter className="flex justify-between items-center text-sm">
        <Badge variant={isCompleted ? "secondary" : "outline"} className={cn(!isCompleted && statusColors[task.status], 'text-white')}>
          {task.status}
        </Badge>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
