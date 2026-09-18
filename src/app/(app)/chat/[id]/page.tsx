import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatThread } from "@/components/ChatThread";

type Ctx = { params: Promise<{ id: string }> };

export default async function ChatDetailPage({ params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      OR: [{ buyerId: user.id }, { sellerId: user.id }],
    },
    include: {
      listing: true,
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: {
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) notFound();

  const other = conversation.buyerId === user.id ? conversation.seller : conversation.buyer;

  return (
    <div className="container-page space-y-4">
      <div>
        <Link href="/chat" className="text-sm text-slate-400 hover:text-yellow-400">
          ← Conversas
        </Link>
        <h1 className="mt-2 text-xl font-bold text-white">
          {conversation.listing.name}{" "}
          <span className="text-sm font-normal text-slate-400">com {other.name}</span>
        </h1>
        <Link href={`/listings/${conversation.listingId}`} className="text-xs text-yellow-400 hover:underline">
          Ver anúncio
        </Link>
      </div>
      <ChatThread
        conversationId={conversation.id}
        currentUserId={user.id}
        initialMessages={conversation.messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          senderId: m.senderId,
          sender: m.sender,
        }))}
      />
    </div>
  );
}
