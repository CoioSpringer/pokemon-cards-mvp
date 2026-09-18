"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./ImageUploadField";

type PortfolioOption = {
  id: string;
  name: string;
  set: string;
  condition: string;
  priceBRL: number;
  photoUrl: string;
  notes: string;
};

export type ListingFormValues = {
  id?: string;
  mode: "HAVE" | "WANT";
  name: string;
  set: string;
  condition: string;
  priceBRL: number;
  notes: string;
  photoUrl: string;
};

export function ListingForm({
  portfolio = [],
  initial,
  defaultPortfolioCardId = "",
}: {
  portfolio?: PortfolioOption[];
  initial?: ListingFormValues;
  defaultPortfolioCardId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"HAVE" | "WANT">(initial?.mode || "HAVE");
  const [selected, setSelected] = useState(defaultPortfolioCardId);
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl || "");
  const [name, setName] = useState(initial?.name || "");
  const [setValue, setSetValue] = useState(initial?.set || "");
  const [condition, setCondition] = useState(initial?.condition || "NM");
  const [priceBRL, setPriceBRL] = useState(String(initial?.priceBRL ?? 0));
  const [notes, setNotes] = useState(initial?.notes || "");
  const editing = Boolean(initial?.id);

  function applyPortfolio(id: string) {
    setSelected(id);
    const card = portfolio.find((c) => c.id === id);
    if (!card) return;
    setName(card.name);
    setSetValue(card.set);
    setCondition(card.condition);
    setPriceBRL(String(card.priceBRL));
    setPhotoUrl(card.photoUrl || "");
    setNotes(card.notes || "");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      mode,
      name,
      set: setValue,
      condition,
      priceBRL: Number(priceBRL || 0),
      notes,
      photoUrl,
      ...(editing ? {} : { portfolioCardId: selected || null }),
    };

    const res = await fetch(editing ? `/api/listings/${initial!.id}` : "/api/listings", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || (editing ? "Erro ao atualizar anúncio" : "Erro ao criar anúncio"));
      return;
    }
    router.push(`/listings/${data.listing.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("HAVE")}
          className={`rounded-xl py-2 text-sm font-semibold ${
            mode === "HAVE" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300"
          }`}
        >
          Tenho (vendo)
        </button>
        <button
          type="button"
          onClick={() => setMode("WANT")}
          className={`rounded-xl py-2 text-sm font-semibold ${
            mode === "WANT" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300"
          }`}
        >
          Quero (procuro)
        </button>
      </div>

      {!editing && portfolio.length > 0 && (
        <label className="block space-y-1 text-sm">
          <span className="text-slate-300">Preencher do portfólio (opcional)</span>
          <select className="field" value={selected} onChange={(e) => applyPortfolio(e.target.value)}>
            <option value="">— manual —</option>
            {portfolio.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.set})
              </option>
            ))}
          </select>
        </label>
      )}

      <input
        name="name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome da carta"
        className="field"
      />
      <input
        name="set"
        required
        value={setValue}
        onChange={(e) => setSetValue(e.target.value)}
        placeholder="Set / expansão"
        className="field"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          name="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="field"
        >
          <option value="NM">NM — Near Mint</option>
          <option value="LP">LP — Little Played</option>
          <option value="MP">MP — Moderately Played</option>
          <option value="HP">HP — Heavily Played</option>
        </select>
        <input
          name="priceBRL"
          type="number"
          step="0.01"
          min="0"
          required
          value={priceBRL}
          onChange={(e) => setPriceBRL(e.target.value)}
          placeholder="Preço R$"
          className="field"
        />
      </div>
      <ImageUploadField value={photoUrl} onChange={setPhotoUrl} previewName={name || "carta"} />
      <textarea
        name="notes"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas / condições da troca"
        className="field"
      />
      {error && (
        <p className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (editing ? "Salvando…" : "Publicando…") : editing ? "Salvar alterações" : "Publicar anúncio"}
      </button>
    </form>
  );
}
