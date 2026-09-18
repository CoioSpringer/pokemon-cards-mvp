"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatBRL, placeholderCardImage } from "@/lib/format";
import { ConditionBadge } from "./ConditionBadge";
import { EmptyState } from "./EmptyState";

export type MyListing = {
  id: string;
  name: string;
  set: string;
  mode: string;
  condition: string;
  priceBRL: number;
  photoUrl: string;
  active: boolean;
  notes: string;
};

export function MyListingsManager({ listings }: { listings: MyListing[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const visible = listings.filter((l) => {
    if (filter === "active") return l.active;
    if (filter === "inactive") return !l.active;
    return true;
  });

  async function setActive(id: string, active: boolean) {
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível atualizar o anúncio.");
      return;
    }
    router.refresh();
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        title="Nenhum anúncio ainda"
        description="Publique um Tenho (vendo) ou Quero (procuro) para aparecer no feed."
        actionHref="/listings/nova"
        actionLabel="Criar anúncio"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Todos"],
            ["active", "Ativos"],
            ["inactive", "Inativos"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === key
                ? "bg-yellow-400 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <EmptyState title="Nada neste filtro" description="Troque o filtro acima para ver outros anúncios." />
      ) : (
        <ul className="space-y-3">
          {visible.map((l) => (
            <li
              key={l.id}
              className={`flex gap-3 rounded-2xl border bg-slate-900 p-3 ${
                l.active ? "border-slate-800" : "border-slate-800/80 opacity-80"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.photoUrl || placeholderCardImage(l.name)}
                alt={l.name}
                className="h-24 w-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      l.mode === "HAVE" ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"
                    }`}
                  >
                    {l.mode === "HAVE" ? "Tenho" : "Quero"}
                  </span>
                  <ConditionBadge condition={l.condition} />
                  {!l.active && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                      Inativo
                    </span>
                  )}
                </div>
                <h3 className="mt-1 truncate font-semibold text-white">{l.name}</h3>
                <p className="truncate text-xs text-slate-400">{l.set}</p>
                <p className="mt-0.5 text-sm font-semibold text-yellow-400">{formatBRL(l.priceBRL)}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <Link href={`/listings/${l.id}`} className="font-medium text-slate-300 hover:text-white">
                    Ver
                  </Link>
                  <Link href={`/listings/${l.id}/editar`} className="font-medium text-sky-400 hover:underline">
                    Editar
                  </Link>
                  {l.active ? (
                    <button
                      type="button"
                      disabled={busyId === l.id}
                      onClick={() => {
                        if (confirm("Desativar este anúncio? Ele some do feed, mas você pode reativar depois.")) {
                          setActive(l.id, false);
                        }
                      }}
                      className="font-medium text-red-400 hover:underline disabled:opacity-50"
                    >
                      {busyId === l.id ? "…" : "Desativar"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === l.id}
                      onClick={() => setActive(l.id, true)}
                      className="font-medium text-emerald-400 hover:underline disabled:opacity-50"
                    >
                      {busyId === l.id ? "…" : "Reativar"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
