"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TcgPick = {
  tcgId: string;
  name: string;
  set: string;
  photoUrl: string;
  number?: string;
  rarity?: string;
};

type ApiCard = {
  id: string;
  name: string;
  number: string;
  setName: string;
  setId: string;
  rarity: string;
  artist: string;
  imageSmall: string;
  imageLarge: string;
};

const DEBOUNCE_MS = 350;

export function TcgCardSearch({ onSelect }: { onSelect: (card: TcgPick) => void }) {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setCards([]);
      setError("");
      setHint(trimmed ? "Digite pelo menos 2 caracteres para buscar." : "");
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError("");
    setHint("");

    try {
      const res = await fetch(`/api/tcg/search?q=${encodeURIComponent(trimmed)}`, {
        signal: ac.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (ac.signal.aborted) return;

      if (!res.ok) {
        setCards([]);
        setError(data.error || "Erro ao buscar cartas.");
        return;
      }

      setCards(Array.isArray(data.cards) ? data.cards : []);
      setHint(data.message || "");
      setOpen(true);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setCards([]);
      setError("Falha ao buscar. Tente novamente.");
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(c: ApiCard) {
    onSelect({
      tcgId: c.id,
      name: c.name,
      set: c.setName || c.setId,
      photoUrl: c.imageLarge || c.imageSmall,
      number: c.number,
      rarity: c.rarity,
    });
    setQuery("");
    setCards([]);
    setOpen(false);
    setHint("");
    setError("");
  }

  return (
    <div ref={wrapRef} className="relative space-y-1">
      <label className="block text-sm text-slate-300">
        Buscar na Pokédex TCG
        <span className="ml-1 text-xs text-slate-500">(opcional — preenche nome, set e foto)</span>
      </label>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (cards.length > 0 || error || hint) setOpen(true);
          }}
          placeholder="Buscar carta na Pokédex TCG…"
          autoComplete="off"
          className="field pr-10"
          aria-autocomplete="list"
          aria-expanded={open && (cards.length > 0 || loading)}
        />
        {loading && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            …
          </span>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-amber-950/50 px-3 py-2 text-xs text-amber-200" role="status">
          {error}
        </p>
      )}
      {!error && hint && query.trim().length >= 2 && !loading && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}

      {open && cards.length > 0 && (
        <ul
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
          role="listbox"
        >
          {cards.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                onClick={() => pick(c)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-800 focus:bg-slate-800 focus:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imageSmall || "/favicon.ico"}
                  alt=""
                  className="h-14 w-10 shrink-0 rounded object-cover ring-1 ring-slate-700"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{c.name}</span>
                  <span className="block truncate text-xs text-slate-400">
                    {c.setName}
                    {c.number ? ` · #${c.number}` : ""}
                    {c.rarity ? ` · ${c.rarity}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
