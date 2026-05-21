import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const candidateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),
  panNumber: z
    .string()
    .regex(
      /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/,
      "PAN must be in format ABCDE1234F"
    )
    .transform((val) => val.toUpperCase()),
  dob: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});
