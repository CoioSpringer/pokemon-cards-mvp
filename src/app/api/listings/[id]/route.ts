import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!listing || !listing.active) {
    return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.listing.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });

  await prisma.listing.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
