import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ChatListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    include: {
      listing: true,
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container-page space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Conversas</h1>
        <p className="text-sm text-slate-400">Chats sobre anúncios — sem pagamentos no app</p>
      </div>

      <ul className="space-y-2">
        {conversations.map((c) => {
          const other = c.buyerId === user.id ? c.seller : c.buyer;
          const last = c.messages[0];
          return (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className="block rounded-2xl border border-slate-800 bg-slate-900 p-4 hover:border-yellow-500/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{c.listing.name}</p>
                    <p className="text-xs text-slate-400">com {other.name}</p>
                    {last && <p className="mt-1 truncate text-sm text-slate-500">{last.body}</p>}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      c.listing.mode === "HAVE" ? "bg-emerald-500/20 text-emerald-300" : "bg-sky-500/20 text-sky-300"
                    }`}
                  >
                    {c.listing.mode === "HAVE" ? "Tenho" : "Quero"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {conversations.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
          Nenhuma conversa ainda. Abra um anúncio no feed e toque em &quot;Conversar&quot;.
        </p>
      )}
    </div>
  );
}
