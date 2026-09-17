import { z } from "zod";

export const createUserSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name is required").max(120),
    lastName: z.string().trim().min(1, "Last name is required").max(120),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    role: z.enum(["admin", "placement_hr", "client_hr", "student"]),
    enrollmentId: z.string().trim().max(100).optional().or(z.literal("")),
    companyId: z.string().uuid().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.role === "student" && !data.enrollmentId) {
      ctx.addIssue({
        code: "custom",
        path: ["enrollmentId"],
        message: "Enrollment ID is required for students",
      });
    }

    if (data.role === "client_hr" && !data.companyId) {
      ctx.addIssue({
        code: "custom",
        path: ["companyId"],
        message: "Company is required for Client HR",
      });
    }
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
