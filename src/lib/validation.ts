import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const clientSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required"),
  company: z.string().trim().min(1, "Company is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  website: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]),
  ownerId: z.string().trim().optional().or(z.literal("")),
});

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional().or(z.literal("")),
  clientId: z.string().trim().min(1, "Client is required"),
  status: z.enum(["PLANNING", "IN_PROGRESS", "REVIEW", "ON_HOLD", "COMPLETED"]),
  budget: z.coerce.number().min(0).default(0),
  startDate: z.string().trim().optional().or(z.literal("")),
  dueDate: z.string().trim().optional().or(z.literal("")),
  memberIds: z.array(z.string()).optional().default([]),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  projectId: z.string().trim().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assigneeId: z.string().trim().optional().or(z.literal("")),
  dueDate: z.string().trim().optional().or(z.literal("")),
});

export const timeEntrySchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  taskId: z.string().trim().optional().or(z.literal("")),
  hours: z.coerce.number().min(0.01, "Enter hours worked").max(24),
  date: z.string().trim().min(1),
  billable: z.coerce.boolean().default(true),
  note: z.string().trim().optional().or(z.literal("")),
});

export const proposalSchema = z.object({
  clientId: z.string().trim().min(1, "Client is required"),
  title: z.string().trim().min(1, "Title is required"),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "DECLINED"]),
  amount: z.coerce.number().min(0),
  validUntil: z.string().trim().optional().or(z.literal("")),
  content: z.string().trim().optional().or(z.literal("")),
});

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01),
  rate: z.coerce.number().min(0),
});

export const invoiceSchema = z.object({
  clientId: z.string().trim().min(1, "Client is required"),
  projectId: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  issueDate: z.string().trim().min(1),
  dueDate: z.string().trim().min(1),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().trim().optional().or(z.literal("")),
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01),
  method: z.string().trim().min(1),
  paidAt: z.string().trim().min(1),
  reference: z.string().trim().optional().or(z.literal("")),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email(),
  title: z.string().trim().optional().or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
  password: z.string().min(8, "Minimum 8 characters").optional().or(z.literal("")),
});
