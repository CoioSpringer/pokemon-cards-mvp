import Link from "next/link";

type Props = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xl">
        📦
      </div>
      <p className="font-semibold text-white">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-4 inline-flex">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
