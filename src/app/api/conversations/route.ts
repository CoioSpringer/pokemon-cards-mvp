import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: user.id }, { sellerId: user.id }],
    },
    include: {
      listing: true,
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const { listingId } = await req.json();
    if (!listingId) {
      return NextResponse.json({ error: "listingId obrigatório" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || !listing.active) {
      return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
    }
    if (listing.userId === user.id) {
      return NextResponse.json({ error: "Você não pode conversar no próprio anúncio" }, { status: 400 });
    }

    const existing = await prisma.conversation.findUnique({
      where: {
        listingId_buyerId: { listingId, buyerId: user.id },
      },
    });
    if (existing) {
      return NextResponse.json({ conversation: existing });
    }

    const conversation = await prisma.conversation.create({
      data: {
        listingId,
        buyerId: user.id,
        sellerId: listing.userId,
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao iniciar conversa";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
