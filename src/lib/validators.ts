import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(80),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha com pelo menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const portfolioSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120),
  set: z.string().min(1, "Set obrigatório").max(120),
  condition: z.enum(["NM", "LP", "MP", "HP"]),
  priceBRL: z.coerce.number().min(0, "Preço inválido"),
  notes: z.string().max(1000).optional().default(""),
  photoUrl: z.string().max(500).optional().default(""),
});

export const listingSchema = z.object({
  mode: z.enum(["HAVE", "WANT"]),
  name: z.string().min(1).max(120),
  set: z.string().min(1).max(120),
  condition: z.enum(["NM", "LP", "MP", "HP"]),
  priceBRL: z.coerce.number().min(0),
  notes: z.string().max(1000).optional().default(""),
  photoUrl: z.string().max(500).optional().default(""),
  portfolioCardId: z.string().optional().nullable(),
});

export const messageSchema = z.object({
  body: z.string().min(1, "Mensagem vazia").max(2000),
});
