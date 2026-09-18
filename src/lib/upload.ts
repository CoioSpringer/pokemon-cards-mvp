import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function uploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}

export async function saveUploadedImage(file: File): Promise<{ url: string; error?: never } | { url?: never; error: string }> {
  const mime = file.type;
  const ext = ALLOWED_IMAGE_TYPES[mime];
  if (!ext) {
    return { error: "Tipo de arquivo inválido. Use JPG, PNG, WebP ou GIF." };
  }
  if (file.size <= 0) {
    return { error: "Arquivo vazio." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Imagem muito grande. Máximo 5 MB." };
  }

  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return { url: `/uploads/${filename}` };
}
