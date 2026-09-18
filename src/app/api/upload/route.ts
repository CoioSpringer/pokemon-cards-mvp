import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo de imagem no campo file." }, { status: 400 });
    }

    const result = await saveUploadedImage(file);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Falha ao salvar a imagem." }, { status: 500 });
  }
}
