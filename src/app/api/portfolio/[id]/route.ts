import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { portfolioSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.portfolioCard.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Carta não encontrada" }, { status: 404 });

  try {
    const body = await req.json();
    const data = portfolioSchema.parse(body);
    const card = await prisma.portfolioCard.update({
      where: { id },
      data: {
        name: data.name,
        set: data.set,
        condition: data.condition,
        priceBRL: data.priceBRL,
        notes: data.notes || "",
        photoUrl: data.photoUrl || "",
      },
    });
    return NextResponse.json({ card });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.portfolioCard.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Carta não encontrada" }, { status: 404 });

  await prisma.portfolioCard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
