"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL, placeholderCardImage } from "@/lib/format";
import { PortfolioForm, PortfolioValues } from "./PortfolioForm";

type Card = PortfolioValues & { id: string };

export function PortfolioList({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Card | null>(null);

  async function remove(id: string) {
    if (!confirm("Remover esta carta do portfólio?")) return;
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {editing && (
        <PortfolioForm
          initial={editing}
          onDone={() => setEditing(null)}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <article key={card.id} className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.photoUrl || placeholderCardImage(card.name)}
              alt={card.name}
              className="h-24 w-16 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-white">{card.name}</h3>
              <p className="truncate text-xs text-slate-400">{card.set}</p>
              <p className="mt-1 text-sm text-yellow-400">{formatBRL(card.priceBRL)}</p>
              <p className="text-xs text-slate-500">{card.condition}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => setEditing(card)} className="text-xs text-sky-400">
                  Editar
                </button>
                <button type="button" onClick={() => remove(card.id)} className="text-xs text-red-400">
                  Remover
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {cards.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
          Seu portfólio está vazio. Adicione sua primeira carta acima.
        </p>
      )}
    </div>
  );
}
