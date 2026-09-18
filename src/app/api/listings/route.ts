import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema } from "@/lib/validators";
import { ListingMode, Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");
  const q = searchParams.get("q")?.trim();
  const set = searchParams.get("set")?.trim();
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const mine = searchParams.get("mine") === "1";
  const includeInactive = searchParams.get("includeInactive") === "1";

  const user = await getCurrentUser();

  const where: Prisma.ListingWhereInput = {};

  if (mine) {
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    where.userId = user.id;
    if (!includeInactive) where.active = true;
  } else {
    where.active = true;
  }

  if (mode === "HAVE" || mode === "WANT") {
    where.mode = mode as ListingMode;
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { set: { contains: q } },
      { notes: { contains: q } },
    ];
  }

  if (set) {
    where.set = { contains: set };
  }

  if (minPrice || maxPrice) {
    where.priceBRL = {};
    if (minPrice) where.priceBRL.gte = Number(minPrice);
    if (maxPrice) where.priceBRL.lte = Number(maxPrice);
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ listings });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = listingSchema.parse(body);

    if (data.portfolioCardId) {
      const card = await prisma.portfolioCard.findFirst({
        where: { id: data.portfolioCardId, userId: user.id },
      });
      if (!card) {
        return NextResponse.json({ error: "Carta do portfólio não encontrada" }, { status: 400 });
      }
    }

    const listing = await prisma.listing.create({
      data: {
        userId: user.id,
        portfolioCardId: data.portfolioCardId || null,
        mode: data.mode,
        name: data.name,
        set: data.set,
        condition: data.condition,
        priceBRL: data.priceBRL,
        notes: data.notes || "",
        photoUrl: data.photoUrl || "",
        tcgId: data.tcgId || "",
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao criar anúncio";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
