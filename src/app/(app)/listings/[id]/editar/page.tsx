import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/ListingForm";

type Ctx = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, userId: user.id },
  });
  if (!listing) notFound();

  return (
    <div className="container-page max-w-xl space-y-4">
      <div>
        <Link href={`/listings/${listing.id}`} className="text-sm text-slate-400 hover:text-yellow-400">
          ← Voltar ao anúncio
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Editar anúncio</h1>
        <p className="text-sm text-slate-400">
          {listing.active ? "Anúncio ativo no feed." : "Anúncio inativo — reative em Meus anúncios."}
        </p>
      </div>
      <ListingForm
        initial={{
          id: listing.id,
          mode: listing.mode,
          name: listing.name,
          set: listing.set,
          condition: listing.condition,
          priceBRL: listing.priceBRL,
          notes: listing.notes,
          photoUrl: listing.photoUrl,
        }}
      />
    </div>
  );
}
