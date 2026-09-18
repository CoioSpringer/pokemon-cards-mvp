"use client";

import { FormEvent, useEffect, useState } from "react";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string };
};

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
    }, 4000);
    return () => clearInterval(t);
  }, [conversationId]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessages((prev) => [...prev, data.message]);
      setBody("");
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-400">Nenhuma mensagem ainda. Diga oi!</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  mine ? "bg-yellow-400 text-slate-950" : "bg-slate-800 text-slate-100"
                }`}
              >
                {!mine && <p className="mb-0.5 text-[10px] font-semibold opacity-70">{m.sender.name}</p>}
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-800 p-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="field flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary px-4">
          Enviar
        </button>
      </form>
    </div>
  );
}
