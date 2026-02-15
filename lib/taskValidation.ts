import { z } from 'zod';

// Validation schema for a task
const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  dueDate: z.date().optional(),
});

// Validation utility function
const validateTask = (task) => {
  return taskSchema.safeParse(task);
};

export { taskSchema, validateTask };