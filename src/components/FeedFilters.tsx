"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function FeedFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    const mode = String(form.get("mode") || "");
    const q = String(form.get("q") || "").trim();
    const set = String(form.get("set") || "").trim();
    const minPrice = String(form.get("minPrice") || "").trim();
    const maxPrice = String(form.get("maxPrice") || "").trim();
    if (mode) next.set("mode", mode);
    if (q) next.set("q", q);
    if (set) next.set("set", set);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    router.push(`/feed?${next.toString()}`);
    setTimeout(() => setLoading(false), 400);
  }

  function clear() {
    setLoading(true);
    router.push("/feed");
    setTimeout(() => setLoading(false), 400);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="mode" defaultValue={params.get("mode") || ""} className="field">
          <option value="">Todos (Tenho + Quero)</option>
          <option value="HAVE">Só Tenho</option>
          <option value="WANT">Só Quero</option>
        </select>
        <input
          name="q"
          defaultValue={params.get("q") || ""}
          placeholder="Buscar nome…"
          className="field"
        />
        <input
          name="set"
          defaultValue={params.get("set") || ""}
          placeholder="Filtrar set…"
          className="field"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            name="minPrice"
            type="number"
            min="0"
            step="1"
            defaultValue={params.get("minPrice") || ""}
            placeholder="Preço min"
            className="field"
          />
          <input
            name="maxPrice"
            type="number"
            min="0"
            step="1"
            defaultValue={params.get("maxPrice") || ""}
            placeholder="Preço max"
            className="field"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Filtrando…" : "Filtrar"}
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
