import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyListingsManager } from "@/components/MyListingsManager";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    orderBy: [{ active: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="container-page space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus anúncios</h1>
          <p className="text-sm text-slate-400">Edite, desative ou reative seus Tenho / Quero</p>
        </div>
        <Link href="/listings/nova" className="btn-primary shrink-0">
          Novo
        </Link>
      </div>
      <MyListingsManager
        listings={listings.map((l) => ({
          id: l.id,
          name: l.name,
          set: l.set,
          mode: l.mode,
          condition: l.condition,
          priceBRL: l.priceBRL,
          photoUrl: l.photoUrl,
          active: l.active,
          notes: l.notes,
        }))}
      />
    </div>
  );
}
