"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type PortfolioValues = {
  id?: string;
  name: string;
  set: string;
  condition: string;
  priceBRL: number;
  notes: string;
  photoUrl: string;
};

export function PortfolioForm({
  initial,
  onDone,
}: {
  initial?: PortfolioValues;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const editing = Boolean(initial?.id);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      set: String(form.get("set") || ""),
      condition: String(form.get("condition") || "NM"),
      priceBRL: Number(form.get("priceBRL") || 0),
      notes: String(form.get("notes") || ""),
      photoUrl: String(form.get("photoUrl") || ""),
    };

    const res = await fetch(editing ? `/api/portfolio/${initial!.id}` : "/api/portfolio", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Erro ao salvar");
      return;
    }
    onDone?.();
    router.refresh();
    if (!editing) e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="font-semibold text-white">{editing ? "Editar carta" : "Adicionar carta"}</h2>
      <input name="name" required defaultValue={initial?.name} placeholder="Nome da carta" className="field" />
      <input name="set" required defaultValue={initial?.set} placeholder="Set / expansão" className="field" />
      <div className="grid grid-cols-2 gap-3">
        <select name="condition" defaultValue={initial?.condition || "NM"} className="field">
          <option value="NM">NM</option>
          <option value="LP">LP</option>
          <option value="MP">MP</option>
          <option value="HP">HP</option>
        </select>
        <input
          name="priceBRL"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial?.priceBRL ?? 0}
          placeholder="Preço R$"
          className="field"
        />
      </div>
      <input
        name="photoUrl"
        defaultValue={initial?.photoUrl}
        placeholder="URL da foto (opcional)"
        className="field"
      />
      <textarea
        name="notes"
        defaultValue={initial?.notes}
        placeholder="Notas"
        rows={2}
        className="field"
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Salvando..." : editing ? "Atualizar" : "Adicionar"}
      </button>
    </form>
  );
}
