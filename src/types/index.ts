import { z } from 'zod';

export const taskStatus = ['To Do', 'In Progress', 'Completed'] as const;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(taskStatus).default('To Do'),
  dueDate: z.date().nullable(),
  userId: z.string(),
  createdAt: z.date(),
});

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export type Task = z.infer<typeof TaskSchema>;
export type TaskStatus = z.infer<typeof TaskSchema.shape.status>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
