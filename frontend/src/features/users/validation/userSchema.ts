import { z } from "zod";

export const userFormSchema = z.object({
  schoolId: z.string().min(1, "School ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phoneNumber: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  yearLevel: z.string().min(1, "Year Level is required"),
  role: z.enum(["admin", "faculty", "student"]),
  avatarFile: z.any().optional(),
});
