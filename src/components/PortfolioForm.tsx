"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "./ImageUploadField";
import { TcgCardSearch, TcgPick } from "./TcgCardSearch";

export type PortfolioValues = {
  id?: string;
  name: string;
  set: string;
  condition: string;
  priceBRL: number;
  notes: string;
  photoUrl: string;
  tcgId?: string;
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
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl || "");
  const [name, setName] = useState(initial?.name || "");
  const [setValue, setSetValue] = useState(initial?.set || "");
  const [tcgId, setTcgId] = useState(initial?.tcgId || "");
  const editing = Boolean(initial?.id);

  function applyTcg(card: TcgPick) {
    setName(card.name);
    setSetValue(card.set);
    setPhotoUrl(card.photoUrl || "");
    setTcgId(card.tcgId);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || name || ""),
      set: String(form.get("set") || setValue || ""),
      condition: String(form.get("condition") || "NM"),
      priceBRL: Number(form.get("priceBRL") || 0),
      notes: String(form.get("notes") || ""),
      photoUrl,
      tcgId,
    };

    const res = await fetch(editing ? `/api/portfolio/${initial!.id}` : "/api/portfolio", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Não foi possível salvar a carta. Verifique os campos.");
      return;
    }
    onDone?.();
    router.refresh();
    if (!editing) {
      e.currentTarget.reset();
      setPhotoUrl("");
      setName("");
      setSetValue("");
      setTcgId("");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="font-semibold text-white">{editing ? "Editar carta" : "Adicionar carta"}</h2>
      <TcgCardSearch onSelect={applyTcg} />
      {tcgId && (
        <p className="text-xs text-slate-500">
          Pokédex TCG: <span className="font-mono text-slate-400">{tcgId}</span>
          <button
            type="button"
            className="ml-2 text-sky-400 hover:underline"
            onClick={() => setTcgId("")}
          >
            limpar vínculo
          </button>
        </p>
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
        <select name="condition" defaultValue={initial?.condition || "NM"} className="field">
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
          defaultValue={initial?.priceBRL ?? 0}
          placeholder="Preço R$"
          className="field"
        />
      </div>
      <ImageUploadField value={photoUrl} onChange={setPhotoUrl} previewName={name || "carta"} />
      <textarea
        name="notes"
        defaultValue={initial?.notes}
        placeholder="Notas (opcional)"
        rows={2}
        className="field"
      />
      {error && (
        <p className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        {editing && onDone && (
          <button
            type="button"
            onClick={onDone}
            className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Salvando…" : editing ? "Atualizar" : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
