'use client';

import type { Task, TaskStatus } from '@/types';
import TaskItem from './task-item';
import TaskItemSkeleton from './task-item-skeleton';
import { Button } from './ui/button';

type TaskListProps = {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onNewTask: () => void;
};

export default function TaskList({
  tasks,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  onNewTask,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <TaskItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">No tasks yet!</h2>
        <p className="max-w-xs text-muted-foreground">
          Ready to get productive? Add your first task to get started.
        </p>
        <Button onClick={onNewTask}>Create First Task</Button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
