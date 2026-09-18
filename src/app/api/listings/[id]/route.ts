import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingUpdateSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  const { id } = await ctx.params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!listing) {
    return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
  }
  // Owners can fetch inactive listings (for edit / restore)
  if (!listing.active && (!user || listing.userId !== user.id)) {
    return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function PUT(req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await ctx.params;

  const existing = await prisma.listing.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });

  try {
    const body = await req.json();
    const data = listingUpdateSchema.parse(body);

    if (
      data.mode === undefined &&
      data.name === undefined &&
      data.set === undefined &&
      data.condition === undefined &&
      data.priceBRL === undefined &&
      data.notes === undefined &&
      data.photoUrl === undefined &&
      data.active === undefined
    ) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        ...(data.mode !== undefined ? { mode: data.mode } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.set !== undefined ? { set: data.set } : {}),
        ...(data.condition !== undefined ? { condition: data.condition } : {}),
        ...(data.priceBRL !== undefined ? { priceBRL: data.priceBRL } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ listing });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar anúncio";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
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
