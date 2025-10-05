'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import type { Task, TaskStatus, UpdateTask } from '@/types';
import TaskList from './task-list';
import { Button } from './ui/button';
import { ArrowUpDown, Filter, PlusCircle } from 'lucide-react';
import TaskDialog from './task-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { taskStatus } from '@/types';

export default function TaskDashboard() {
  const { user, loading, idToken } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(new Set(taskStatus));
  const [sortAsc, setSortAsc] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!idToken) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch your tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [idToken, toast]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [user, loading, router, fetchTasks]);

  const handleOpenDialog = (task: Task | null = null) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (refresh: boolean) => {
    setIsDialogOpen(false);
    setEditingTask(null);
    if (refresh) {
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!idToken) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error('Failed to delete task');
      toast({ title: 'Success', description: 'Task deleted successfully.' });
      fetchTasks();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not delete the task.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTaskStatus = async (task: Task, newStatus: TaskStatus) => {
     if (!idToken) return;
     const optimisticTasks = tasks.map(t => t.id === task.id ? {...t, status: newStatus} : t);
     setTasks(optimisticTasks);
     
     try {
       const response = await fetch(`/api/tasks/${task.id}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${idToken}`,
         },
         body: JSON.stringify({ status: newStatus }),
       });
 
       if (!response.ok) throw new Error('Failed to update task status');
       
       // Optional: refetch for data consistency, or rely on optimistic update
       // fetchTasks(); 
     } catch (error) {
       toast({
         title: 'Error',
         description: 'Could not update task status.',
         variant: 'destructive',
       });
       setTasks(tasks); // Revert optimistic update
     }
  };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => statusFilters.has(task.status))
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
        return sortAsc ? timeA - timeB : timeB - timeA;
      });
  }, [tasks, statusFilters, sortAsc]);

  if (loading || (!user && !loading)) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">Your Tasks</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {taskStatus.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.has(status)}
                  onCheckedChange={(checked) => {
                    setStatusFilters((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(status);
                      else next.delete(status);
                      return next;
                    });
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setSortAsc(!sortAsc)}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort by Due Date
          </Button>

          <Button size="sm" onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>
      <TaskList
        tasks={filteredAndSortedTasks}
        isLoading={isLoading}
        onEdit={handleOpenDialog}
        onDelete={handleDeleteTask}
        onStatusChange={handleUpdateTaskStatus}
        onNewTask={() => handleOpenDialog()}
      />
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        task={editingTask}
      />
    </>
  );
}
