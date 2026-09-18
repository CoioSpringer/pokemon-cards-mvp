"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartChatButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Não foi possível iniciar o chat");
      return;
    }
    router.push(`/chat/${data.conversation.id}`);
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={start} disabled={loading} className="btn-primary w-full">
        {loading ? "Abrindo..." : "Conversar sobre este anúncio"}
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
