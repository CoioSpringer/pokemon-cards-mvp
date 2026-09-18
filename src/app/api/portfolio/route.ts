import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { portfolioSchema } from "@/lib/validators";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const cards = await prisma.portfolioCard.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ cards });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = portfolioSchema.parse(body);
    const card = await prisma.portfolioCard.create({
      data: {
        userId: user.id,
        name: data.name,
        set: data.set,
        condition: data.condition,
        priceBRL: data.priceBRL,
        notes: data.notes || "",
        photoUrl: data.photoUrl || "",
      },
    });
    return NextResponse.json({ card }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao criar carta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
