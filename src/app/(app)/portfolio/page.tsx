import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PortfolioForm } from "@/components/PortfolioForm";
import { PortfolioList } from "@/components/PortfolioList";

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cards = await prisma.portfolioCard.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container-page space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meu portfólio</h1>
        <p className="text-sm text-slate-400">
          Cadastre cartas com foto (upload ou URL), set, condição NM/LP/MP/HP, preço em R$ e notas.
        </p>
      </div>
      <PortfolioForm />
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          {cards.length} carta{cards.length === 1 ? "" : "s"}
        </h2>
        <PortfolioList
          cards={cards.map((c) => ({
            id: c.id,
            name: c.name,
            set: c.set,
            condition: c.condition,
            priceBRL: c.priceBRL,
            notes: c.notes,
            photoUrl: c.photoUrl,
          }))}
        />
      </div>
    </div>
  );
}
