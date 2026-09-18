import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONDITION_LABELS, MODE_LABELS, formatBRL, placeholderCardImage } from "@/lib/format";
import { StartChatButton } from "@/components/StartChatButton";
import { OwnerListingActions } from "@/components/OwnerListingActions";
import { ConditionBadge } from "@/components/ConditionBadge";

type Ctx = { params: Promise<{ id: string }> };

export default async function ListingDetailPage({ params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!listing) notFound();

  const isOwner = listing.userId === user.id;
  if (!listing.active && !isOwner) notFound();

  const img = listing.photoUrl || placeholderCardImage(listing.name);

  return (
    <div className="container-page">
      <Link href="/feed" className="text-sm text-slate-400 hover:text-yellow-400">
        ← Voltar ao feed
      </Link>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={listing.name} className="aspect-[3/4] w-full object-cover" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase ${
                  listing.mode === "HAVE" ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"
                }`}
              >
                {MODE_LABELS[listing.mode]}
              </span>
              <ConditionBadge condition={listing.condition} />
              {!listing.active && (
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400">
                  Inativo
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white">{listing.name}</h1>
            <p className="text-slate-400">{listing.set}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-900 p-3 ring-1 ring-slate-800">
              <dt className="text-slate-500">Preço</dt>
              <dd className="text-lg font-bold text-yellow-400">{formatBRL(listing.priceBRL)}</dd>
            </div>
            <div className="rounded-xl bg-slate-900 p-3 ring-1 ring-slate-800">
              <dt className="text-slate-500">Condição</dt>
              <dd className="font-semibold text-white">{CONDITION_LABELS[listing.condition]}</dd>
            </div>
            <div className="col-span-2 rounded-xl bg-slate-900 p-3 ring-1 ring-slate-800">
              <dt className="text-slate-500">Anunciante</dt>
              <dd className="font-semibold text-white">{listing.user.name}</dd>
            </div>
          </dl>

          {listing.notes && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="text-sm font-semibold text-slate-300">Notas</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">{listing.notes}</p>
            </div>
          )}

          {isOwner ? (
            <OwnerListingActions listingId={listing.id} active={listing.active} />
          ) : (
            <StartChatButton listingId={listing.id} />
          )}
        </div>
      </div>
    </div>
  );
}
