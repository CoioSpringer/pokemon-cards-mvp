const STYLES: Record<string, string> = {
  NM: "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
  LP: "bg-lime-500/20 text-lime-300 ring-lime-500/30",
  MP: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
  HP: "bg-orange-500/20 text-orange-300 ring-orange-500/30",
};

export function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span
      className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
        STYLES[condition] || "bg-slate-800 text-slate-300 ring-slate-700"
      }`}
    >
      {condition}
    </span>
  );
}
