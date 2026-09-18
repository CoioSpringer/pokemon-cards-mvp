import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou senha inválidos" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao entrar";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
