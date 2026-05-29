import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalı.")
  .regex(/[A-Za-zğüşıöçĞÜŞİÖÇ]/, "Şifre en az bir harf içermeli.")
  .regex(/[0-9]/, "Şifre en az bir rakam içermeli.");
