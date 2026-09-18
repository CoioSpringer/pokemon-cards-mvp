import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

async function getOwnedConversation(id: string, userId: string) {
  return prisma.conversation.findFirst({
    where: {
      id,
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
  });
}

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await ctx.params;

  const conversation = await getOwnedConversation(id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages, conversation });
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { id } = await ctx.params;

  const conversation = await getOwnedConversation(id, user.id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = messageSchema.parse(body);

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        body: data.body,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao enviar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
