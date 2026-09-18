import Link from "next/link";
import { formatBRL, MODE_LABELS, placeholderCardImage } from "@/lib/format";

type Props = {
  id: string;
  name: string;
  set: string;
  mode: string;
  condition: string;
  priceBRL: number;
  photoUrl?: string | null;
  userName?: string;
};

export function ListingCard({ id, name, set, mode, condition, priceBRL, photoUrl, userName }: Props) {
  const img = photoUrl || placeholderCardImage(name);
  const isHave = mode === "HAVE";

  return (
    <Link
      href={`/listings/${id}`}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm transition hover:border-yellow-500/50"
    >
      <div className="relative aspect-[3/4] bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={name} className="h-full w-full object-cover" />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            isHave ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"
          }`}
        >
          {isHave ? "Tenho" : "Quero"}
        </span>
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 font-semibold text-white">{name}</h3>
        <p className="line-clamp-1 text-xs text-slate-400">{set}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-sm font-bold text-yellow-400">{formatBRL(priceBRL)}</span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">{condition}</span>
        </div>
        {userName && <p className="text-[11px] text-slate-500">por {userName}</p>}
        <p className="sr-only">{MODE_LABELS[mode]}</p>
      </div>
    </Link>
  );
}
