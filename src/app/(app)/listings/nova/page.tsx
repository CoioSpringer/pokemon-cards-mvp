import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/ListingForm";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewListingPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const fromId = typeof sp.from === "string" ? sp.from : "";

  const portfolio = await prisma.portfolioCard.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  const fromCard = fromId ? portfolio.find((c) => c.id === fromId) : undefined;

  return (
    <div className="container-page max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Novo anúncio</h1>
        <p className="text-sm text-slate-400">Publique um Tenho (vendo) ou Quero (procuro).</p>
      </div>
      <ListingForm
        portfolio={portfolio.map((c) => ({
          id: c.id,
          name: c.name,
          set: c.set,
          condition: c.condition,
          priceBRL: c.priceBRL,
          photoUrl: c.photoUrl,
          notes: c.notes,
          tcgId: c.tcgId,
        }))}
        defaultPortfolioCardId={fromCard?.id || ""}
        initial={
          fromCard
            ? {
                mode: "HAVE",
                name: fromCard.name,
                set: fromCard.set,
                condition: fromCard.condition,
                priceBRL: fromCard.priceBRL,
                notes: fromCard.notes,
                photoUrl: fromCard.photoUrl,
                tcgId: fromCard.tcgId,
              }
            : undefined
        }
      />
    </div>
  );
}
