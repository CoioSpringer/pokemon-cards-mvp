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

const photoUrlField = z
  .string()
  .max(1000)
  .optional()
  .default("")
  .transform((v) => (v ?? "").trim());

const tcgIdField = z
  .string()
  .max(80)
  .optional()
  .default("")
  .transform((v) => (v ?? "").trim());

export const portfolioSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(120),
  set: z.string().min(1, "Set obrigatório").max(120),
  condition: z.enum(["NM", "LP", "MP", "HP"]),
  priceBRL: z.coerce.number().min(0, "Preço inválido"),
  notes: z.string().max(1000).optional().default(""),
  photoUrl: photoUrlField,
  tcgId: tcgIdField,
});

export const listingSchema = z.object({
  mode: z.enum(["HAVE", "WANT"]),
  name: z.string().min(1, "Nome obrigatório").max(120),
  set: z.string().min(1, "Set obrigatório").max(120),
  condition: z.enum(["NM", "LP", "MP", "HP"]),
  priceBRL: z.coerce.number().min(0, "Preço inválido"),
  notes: z.string().max(1000).optional().default(""),
  photoUrl: photoUrlField,
  tcgId: tcgIdField,
  portfolioCardId: z.string().optional().nullable(),
});

/** Partial update — no defaults, so omitted fields stay untouched */
export const listingUpdateSchema = z
  .object({
    mode: z.enum(["HAVE", "WANT"]).optional(),
    name: z.string().min(1).max(120).optional(),
    set: z.string().min(1).max(120).optional(),
    condition: z.enum(["NM", "LP", "MP", "HP"]).optional(),
    priceBRL: z.coerce.number().min(0).optional(),
    notes: z.string().max(1000).optional(),
    photoUrl: z
      .string()
      .max(1000)
      .optional()
      .transform((v) => (v === undefined ? undefined : v.trim())),
    tcgId: z
      .string()
      .max(80)
      .optional()
      .transform((v) => (v === undefined ? undefined : v.trim())),
    active: z.boolean().optional(),
  })
  .strict();

export const messageSchema = z.object({
  body: z.string().min(1, "Mensagem vazia").max(2000),
});
