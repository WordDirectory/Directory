import * as z from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(120, "Password cannot be longer than 100 characters");

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(255, "Email cannot be longer than 255 characters"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

export type SignupValues = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email cannot be longer than 255 characters"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
