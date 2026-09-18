import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  return (
    <div className="container-page">
      <section className="mx-auto max-w-2xl space-y-6 py-10 text-center">
        <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-yellow-400 ring-1 ring-yellow-500/30">
          Marketplace BR · Pokémon TCG
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Troque o grupo de WhatsApp por um feed de{" "}
          <span className="text-yellow-400">Tenho</span> e{" "}
          <span className="text-sky-400">Quero</span>
        </h1>
        <p className="text-slate-400">
          Cadastre seu portfólio, publique anúncios, filtre cartas e converse direto com outros
          colecionadores. Sem pagamentos no app — só combinar a troca.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="btn-primary w-full sm:w-auto">
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-900 sm:w-auto"
          >
            Entrar (demo)
          </Link>
        </div>
        <div className="grid gap-3 pt-6 text-left sm:grid-cols-3">
          {[
            ["Portfólio", "Guarde suas cartas com foto, set, condição e preço em R$."],
            ["Feed", "Busque e filtre anúncios Tenho/Quero por nome, set e faixa de preço."],
            ["Chat", "Fale direto com o anunciante sobre a carta — sem intermediário."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="font-semibold text-white">{title}</h2>
              <p className="mt-1 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
