import Link from "next/link";
import { formatBRL, MODE_LABELS, placeholderCardImage } from "@/lib/format";
import { ConditionBadge } from "./ConditionBadge";

type Props = {
  id: string;
  name: string;
  set: string;
  mode: string;
  condition: string;
  priceBRL: number;
  photoUrl?: string | null;
  userName?: string;
  active?: boolean;
  href?: string;
};

export function ListingCard({
  id,
  name,
  set,
  mode,
  condition,
  priceBRL,
  photoUrl,
  userName,
  active = true,
  href,
}: Props) {
  const img = photoUrl || placeholderCardImage(name);
  const isHave = mode === "HAVE";

  return (
    <Link
      href={href || `/listings/${id}`}
      className={`group overflow-hidden rounded-2xl border bg-slate-900 shadow-sm transition hover:border-yellow-500/50 ${
        active ? "border-slate-800" : "border-slate-800 opacity-70"
      }`}
    >
      <div className="relative aspect-[3/4] bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow ${
            isHave ? "bg-emerald-500 text-white" : "bg-sky-500 text-white"
          }`}
        >
          {isHave ? "Tenho" : "Quero"}
        </span>
        {!active && (
          <span className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300 ring-1 ring-slate-600">
            Inativo
          </span>
        )}
        <div className="absolute bottom-2 right-2">
          <ConditionBadge condition={condition} />
        </div>
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 font-semibold text-white">{name}</h3>
        <p className="line-clamp-1 text-xs text-slate-400">{set}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-sm font-bold text-yellow-400">{formatBRL(priceBRL)}</span>
        </div>
        {userName && <p className="text-[11px] text-slate-500">por {userName}</p>}
        <p className="sr-only">{MODE_LABELS[mode]}</p>
      </div>
    </Link>
  );
}
