"use client";

import { useEffect, useRef, useState } from "react";
import { placeholderCardImage } from "@/lib/format";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewName?: string;
};

export function ImageUploadField({
  value,
  onChange,
  label = "Foto da carta",
  previewName = "carta",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrl, setShowUrl] = useState(Boolean(value && !value.startsWith("/uploads/")));
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  async function onFileChange(file: File | null) {
    setError("");
    if (!file) return;

    if (localPreview) URL.revokeObjectURL(localPreview);
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha no upload");
        setLocalPreview(null);
        return;
      }
      onChange(data.url);
      setShowUrl(false);
    } catch {
      setError("Não foi possível enviar a imagem. Tente de novo.");
      setLocalPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const display = localPreview || value || placeholderCardImage(previewName);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-300">{label}</span>
        <button
          type="button"
          className="text-xs text-slate-400 hover:text-yellow-400"
          onClick={() => setShowUrl((v) => !v)}
        >
          {showUrl ? "Usar arquivo" : "Usar URL"}
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={display} alt="Pré-visualização" className="h-full w-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-[10px] font-semibold text-yellow-300">
              Enviando…
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {!showUrl ? (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploading}
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-yellow-300 hover:file:bg-slate-700"
              />
              <p className="text-[11px] text-slate-500">JPG, PNG, WebP ou GIF · máx. 5 MB</p>
            </>
          ) : (
            <input
              type="url"
              value={value}
              onChange={(e) => {
                setLocalPreview(null);
                onChange(e.target.value);
              }}
              placeholder="https://… ou /uploads/…"
              className="field"
            />
          )}
          {value && (
            <button
              type="button"
              className="text-xs text-red-400 hover:underline"
              onClick={() => {
                setLocalPreview(null);
                onChange("");
              }}
            >
              Remover foto
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-950/50 px-2 py-1.5 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
