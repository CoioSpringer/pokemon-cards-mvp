import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { FeedFilters } from "@/components/FeedFilters";
import { EmptyState } from "@/components/EmptyState";
import { ListingMode, Prisma } from "@prisma/client";
import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function FeedPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const mode = typeof sp.mode === "string" ? sp.mode : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const set = typeof sp.set === "string" ? sp.set.trim() : "";
  const minPrice = typeof sp.minPrice === "string" ? sp.minPrice : "";
  const maxPrice = typeof sp.maxPrice === "string" ? sp.maxPrice : "";
  const hasFilters = Boolean(mode || q || set || minPrice || maxPrice);

  const where: Prisma.ListingWhereInput = { active: true };
  if (mode === "HAVE" || mode === "WANT") where.mode = mode as ListingMode;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { set: { contains: q } },
      { notes: { contains: q } },
    ];
  }
  if (set) where.set = { contains: set };
  if (minPrice || maxPrice) {
    where.priceBRL = {};
    if (minPrice) where.priceBRL.gte = Number(minPrice);
    if (maxPrice) where.priceBRL.lte = Number(maxPrice);
  }

  const listings = await prisma.listing.findMany({
    where,
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="container-page space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Feed</h1>
          <p className="text-sm text-slate-400">Explore anúncios Tenho e Quero</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/meus-anuncios"
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-900"
          >
            Meus anúncios
          </Link>
          <Link href="/listings/nova" className="btn-primary">
            Novo anúncio
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
            Carregando filtros…
          </div>
        }
      >
        <FeedFilters />
      </Suspense>

      <p className="text-xs text-slate-500">
        {listings.length} anúncio{listings.length === 1 ? "" : "s"}
      </p>

      {listings.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Nenhum anúncio com esses filtros" : "Feed ainda vazio"}
          description={
            hasFilters
              ? "Tente limpar os filtros ou buscar por outro set / nome."
              : "Seja o primeiro a publicar um Tenho ou Quero."
          }
          actionHref={hasFilters ? "/feed" : "/listings/nova"}
          actionLabel={hasFilters ? "Limpar filtros" : "Publicar anúncio"}
        />
      ) : (
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
              userName={l.user.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
