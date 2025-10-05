'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirebase, useFirestore, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import type { Task, TaskStatus } from '@/types';
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
import { collection, doc } from 'firebase/firestore';

export default function TaskDashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(new Set(taskStatus));
  const [sortAsc, setSortAsc] = useState(true);

  const tasksCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'tasks');
  }, [firestore, user]);

  const { data: tasks, isLoading: isLoadingTasks, error } = useCollection<Task>(tasksCollectionRef);

  if (error) {
    // This will be caught by the FirebaseErrorListener
  }

  const handleOpenDialog = (task: Task | null = null) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(firestore, 'users', user.uid, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
    toast({ title: 'Success', description: 'Task deleted successfully.' });
  };

  const handleUpdateTaskStatus = async (task: Task, newStatus: TaskStatus) => {
     if (!user) return;
     const taskRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
     updateDocumentNonBlocking(taskRef, { status: newStatus });
  };

  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((task) => statusFilters.has(task.status))
      .sort((a, b) => {
        const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (sortAsc) {
          return timeA - timeB;
        }
        return timeB - timeA;
      });
  }, [tasks, statusFilters, sortAsc]);
  
  if (isUserLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
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
        isLoading={isLoadingTasks}
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
