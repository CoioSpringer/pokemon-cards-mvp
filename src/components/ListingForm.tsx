"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PortfolioOption = {
  id: string;
  name: string;
  set: string;
  condition: string;
  priceBRL: number;
  photoUrl: string;
  notes: string;
};

export function ListingForm({ portfolio }: { portfolio: PortfolioOption[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"HAVE" | "WANT">("HAVE");
  const [selected, setSelected] = useState("");

  function applyPortfolio(id: string) {
    setSelected(id);
    const card = portfolio.find((c) => c.id === id);
    if (!card) return;
    const form = document.getElementById("listing-form") as HTMLFormElement | null;
    if (!form) return;
    (form.elements.namedItem("name") as HTMLInputElement).value = card.name;
    (form.elements.namedItem("set") as HTMLInputElement).value = card.set;
    (form.elements.namedItem("condition") as HTMLSelectElement).value = card.condition;
    (form.elements.namedItem("priceBRL") as HTMLInputElement).value = String(card.priceBRL);
    (form.elements.namedItem("photoUrl") as HTMLInputElement).value = card.photoUrl || "";
    (form.elements.namedItem("notes") as HTMLTextAreaElement).value = card.notes || "";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      mode,
      name: String(form.get("name") || ""),
      set: String(form.get("set") || ""),
      condition: String(form.get("condition") || "NM"),
      priceBRL: Number(form.get("priceBRL") || 0),
      notes: String(form.get("notes") || ""),
      photoUrl: String(form.get("photoUrl") || ""),
      portfolioCardId: selected || null,
    };

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erro ao criar anúncio");
      return;
    }
    router.push(`/listings/${data.listing.id}`);
    router.refresh();
  }

  return (
    <form id="listing-form" onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("HAVE")}
          className={`rounded-xl py-2 text-sm font-semibold ${mode === "HAVE" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Tenho (vendo)
        </button>
        <button
          type="button"
          onClick={() => setMode("WANT")}
          className={`rounded-xl py-2 text-sm font-semibold ${mode === "WANT" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300"}`}
        >
          Quero (procuro)
        </button>
      </div>

      {portfolio.length > 0 && (
        <label className="block space-y-1 text-sm">
          <span className="text-slate-300">Preencher do portfólio (opcional)</span>
          <select
            className="field"
            value={selected}
            onChange={(e) => applyPortfolio(e.target.value)}
          >
            <option value="">— manual —</option>
            {portfolio.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.set})
              </option>
            ))}
          </select>
        </label>
      )}

      <input name="name" required placeholder="Nome da carta" className="field" />
      <input name="set" required placeholder="Set / expansão" className="field" />
      <div className="grid grid-cols-2 gap-3">
        <select name="condition" defaultValue="NM" className="field">
          <option value="NM">NM</option>
          <option value="LP">LP</option>
          <option value="MP">MP</option>
          <option value="HP">HP</option>
        </select>
        <input name="priceBRL" type="number" step="0.01" min="0" required defaultValue={0} placeholder="Preço R$" className="field" />
      </div>
      <input name="photoUrl" placeholder="URL da foto (opcional)" className="field" />
      <textarea name="notes" rows={3} placeholder="Notas / condições da troca" className="field" />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Publicando..." : "Publicar anúncio"}
      </button>
    </form>
  );
}
