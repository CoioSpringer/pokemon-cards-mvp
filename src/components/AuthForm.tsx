"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload: Record<string, string> = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };
    if (mode === "signup") payload.name = String(form.get("name") || "");

    const res = await fetch(`/api/auth/${mode === "login" ? "login" : "signup"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Falha na autenticação");
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-white">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
      <p className="text-sm text-slate-400">
        Marketplace brasileiro de cartas Pokémon — Tenho / Quero.
      </p>

      {mode === "signup" && (
        <label className="block space-y-1 text-sm">
          <span className="text-slate-300">Nome</span>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-yellow-400"
            placeholder="Seu nome"
          />
        </label>
      )}

      <label className="block space-y-1 text-sm">
        <span className="text-slate-300">E-mail</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-yellow-400"
          placeholder="voce@email.com"
          defaultValue={mode === "login" ? "demo@pokemon.local" : ""}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="text-slate-300">Senha</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 6 : 1}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-yellow-400"
          placeholder="••••••••"
          defaultValue={mode === "login" ? "demo1234" : ""}
        />
      </label>

      {error && <p className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-yellow-400 py-2.5 font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-60"
      >
        {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
      </button>

      <p className="text-center text-sm text-slate-400">
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <Link href="/signup" className="text-yellow-400 hover:underline">
              Cadastre-se
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="text-yellow-400 hover:underline">
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
