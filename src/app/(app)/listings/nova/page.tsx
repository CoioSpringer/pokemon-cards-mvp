import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/ListingForm";

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const portfolio = await prisma.portfolioCard.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

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
        }))}
      />
    </div>
  );
}
