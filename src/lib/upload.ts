import { put } from "@vercel/blob";
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

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function saveToBlob(
  filename: string,
  buffer: Buffer,
  mime: string,
): Promise<string> {
  const blob = await put(`uploads/${filename}`, buffer, {
    access: "public",
    contentType: mime,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

async function saveToLocalDisk(filename: string, buffer: Buffer): Promise<string> {
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function saveUploadedImage(
  file: File,
): Promise<{ url: string; error?: never } | { url?: never; error: string }> {
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

  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (hasBlobToken()) {
      const url = await saveToBlob(filename, buffer, mime);
      return { url };
    }

    // Local disk only for development (Vercel serverless has no persistent FS)
    if (process.env.NODE_ENV === "production") {
      return {
        error:
          "Upload em produção exige BLOB_READ_WRITE_TOKEN (Vercel Blob). Configure no painel da Vercel.",
      };
    }

    const url = await saveToLocalDisk(filename, buffer);
    return { url };
  } catch (err) {
    console.error("saveUploadedImage failed", err);
    return { error: "Falha ao salvar a imagem." };
  }
}
