import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href={user ? "/feed" : "/"} className="flex items-center gap-2 font-bold text-yellow-400">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm text-white">
            ポ
          </span>
          <span className="text-sm sm:text-base">PokéCards BR</span>
        </Link>

        {user ? (
          <nav className="flex max-w-[70%] items-center gap-0.5 overflow-x-auto text-[11px] sm:max-w-none sm:gap-2 sm:text-sm">
            <Link className="whitespace-nowrap rounded-lg px-2 py-1 text-slate-200 hover:bg-slate-800" href="/feed">
              Feed
            </Link>
            <Link
              className="whitespace-nowrap rounded-lg px-2 py-1 text-slate-200 hover:bg-slate-800"
              href="/portfolio"
            >
              Portfólio
            </Link>
            <Link
              className="whitespace-nowrap rounded-lg px-2 py-1 text-slate-200 hover:bg-slate-800"
              href="/meus-anuncios"
            >
              Anúncios
            </Link>
            <Link
              className="whitespace-nowrap rounded-lg px-2 py-1 text-slate-200 hover:bg-slate-800"
              href="/listings/nova"
            >
              Anunciar
            </Link>
            <Link className="whitespace-nowrap rounded-lg px-2 py-1 text-slate-200 hover:bg-slate-800" href="/chat">
              Chat
            </Link>
            <span className="hidden text-slate-400 sm:inline">{user.name.split(" ")[0]}</span>
            <LogoutButton />
          </nav>
        ) : (
          <nav className="flex items-center gap-2 text-sm">
            <Link className="rounded-lg px-3 py-1.5 text-slate-200 hover:bg-slate-800" href="/login">
              Entrar
            </Link>
            <Link
              className="rounded-lg bg-yellow-400 px-3 py-1.5 font-semibold text-slate-950 hover:bg-yellow-300"
              href="/signup"
            >
              Cadastrar
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
