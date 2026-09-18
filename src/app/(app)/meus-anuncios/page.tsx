import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listings = await prisma.listing.findMany({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus anúncios</h1>
          <p className="text-sm text-slate-400">Anúncios ativos que você publicou</p>
        </div>
        <Link href="/listings/nova" className="btn-primary">
          Novo
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {listings.map((l) => (
          <ListingCard
            key={l.id}
            id={l.id}
            name={l.name}
            set={l.set}
            mode={l.mode}
            condition={l.condition}
            priceBRL={l.priceBRL}
            photoUrl={l.photoUrl}
          />
        ))}
      </div>
      {listings.length === 0 && (
        <p className="text-center text-slate-400">Você ainda não publicou anúncios.</p>
      )}
    </div>
  );
}
