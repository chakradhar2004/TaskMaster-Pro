import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const taskStatus = ['To Do', 'In Progress', 'Completed'] as const;

// Firestore returns Timestamps, but we use strings or Dates on the client for forms.
const dateOrString = z.union([z.instanceof(Date), z.string(), z.instanceof(Timestamp)]);

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullish(),
  status: z.enum(taskStatus).default('To Do'),
  dueDate: dateOrString.nullable(),
  createdAt: dateOrString.optional(), // Made optional for client-side creation
});

export const CreateTaskSchema = TaskSchema.pick({
  title: true,
  description: true,
  status: true,
  dueDate: true,
}).extend({
    dueDate: z.date().nullable(), // For react-hook-form
});


export const UpdateTaskSchema = CreateTaskSchema.partial();

export const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskStatus = z.infer<typeof TaskSchema.shape.status>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
