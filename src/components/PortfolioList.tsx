"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatBRL, placeholderCardImage } from "@/lib/format";
import { PortfolioForm, PortfolioValues } from "./PortfolioForm";
import { ConditionBadge } from "./ConditionBadge";
import { EmptyState } from "./EmptyState";

type Card = PortfolioValues & { id: string };

export function PortfolioList({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Card | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Remover esta carta do portfólio?")) return;
    setBusyId(id);
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      alert("Não foi possível remover a carta.");
      return;
    }
    if (editing?.id === id) setEditing(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {editing && (
        <PortfolioForm initial={editing} onDone={() => setEditing(null)} />
      )}

      {cards.length === 0 ? (
        <EmptyState
          title="Portfólio vazio"
          description="Adicione sua primeira carta com foto, set, condição e preço em R$."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <article
              key={card.id}
              className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3 transition hover:border-slate-700"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.photoUrl || placeholderCardImage(card.name)}
                alt={card.name}
                className="h-28 w-20 rounded-xl object-cover ring-1 ring-slate-800"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate font-semibold text-white">{card.name}</h3>
                  <ConditionBadge condition={card.condition} />
                </div>
                <p className="truncate text-xs text-slate-400">{card.set}</p>
                <p className="mt-1 text-sm font-semibold text-yellow-400">{formatBRL(card.priceBRL)}</p>
                {card.notes && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{card.notes}</p>}
                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(card)}
                    className="text-xs font-medium text-sky-400 hover:underline"
                  >
                    Editar
                  </button>
                  <Link
                    href={`/listings/nova?from=${card.id}`}
                    className="text-xs font-medium text-yellow-400 hover:underline"
                  >
                    Anunciar
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === card.id}
                    onClick={() => remove(card.id)}
                    className="text-xs font-medium text-red-400 hover:underline disabled:opacity-50"
                  >
                    {busyId === card.id ? "Removendo…" : "Remover"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
