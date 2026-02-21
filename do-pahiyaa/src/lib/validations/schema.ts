import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const listingSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    price: z.number().positive("Price must be a positive number"),
    make: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
    kms_driven: z.number().int().nonnegative(),
    city: z.string().min(2, "City is required"),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    specs: z.record(z.any()).optional(),
});
