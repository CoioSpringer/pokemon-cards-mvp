"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function OwnerListingActions({
  listingId,
  active,
}: {
  listingId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggle(next: boolean) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/listings/${listingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Falha ao atualizar");
      return;
    }
    router.refresh();
    if (!next) router.push("/meus-anuncios");
  }

  return (
    <div className="space-y-2 rounded-xl bg-slate-900 p-3 ring-1 ring-slate-800">
      <p className="text-sm text-slate-400">
        Este é o seu anúncio. Gerencie em{" "}
        <Link href="/meus-anuncios" className="text-yellow-400 hover:underline">
          Meus anúncios
        </Link>{" "}
        ou no chat.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/listings/${listingId}/editar`}
          className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
        >
          Editar
        </Link>
        {active ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (confirm("Desativar este anúncio?")) toggle(false);
            }}
            className="rounded-xl border border-red-900/60 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/40 disabled:opacity-50"
          >
            {loading ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => toggle(true)}
            className="rounded-xl border border-emerald-900/60 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-950/40 disabled:opacity-50"
          >
            {loading ? "…" : "Reativar"}
          </button>
        )}
        <Link href="/chat" className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700">
          Ver chat
        </Link>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
