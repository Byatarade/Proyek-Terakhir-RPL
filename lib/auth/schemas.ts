import { z } from "zod";

/**
 * Slugify helper to convert store name to a valid URL slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: "Nama lengkap minimal 2 karakter" })
      .max(80, { message: "Nama lengkap maksimal 80 karakter" }),
    storeName: z
      .string()
      .trim()
      .min(2, { message: "Nama toko minimal 2 karakter" })
      .max(60, { message: "Nama toko maksimal 60 karakter" }),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, { message: "Slug tautan minimal 3 karakter" })
      .max(50, { message: "Slug tautan maksimal 50 karakter" })
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message:
          "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-) tanpa spasi",
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Format alamat email tidak valid" }),
    password: z
      .string()
      .min(8, { message: "Kata sandi minimal 8 karakter" })
      .max(72, { message: "Kata sandi maksimal 72 karakter" }),
    confirmPassword: z.string().min(1, { message: "Konfirmasi kata sandi wajib diisi" }),
    terms: z.literal(true, {
      message: "Anda harus menyetujui syarat & ketentuan layanan",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Format alamat email tidak valid" }),
  password: z
    .string()
    .min(6, { message: "Kata sandi minimal 6 karakter" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Format alamat email tidak valid" }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Kata sandi baru minimal 8 karakter" })
      .max(72, { message: "Kata sandi baru maksimal 72 karakter" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Konfirmasi kata sandi wajib diisi" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

