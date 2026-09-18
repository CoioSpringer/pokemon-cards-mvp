import { NextResponse } from "next/server";

const TCG_BASE = "https://api.pokemontcg.io/v2";
const PAGE_SIZE = 20;

export type TcgSearchCard = {
  id: string;
  name: string;
  number: string;
  setName: string;
  setId: string;
  rarity: string;
  artist: string;
  imageSmall: string;
  imageLarge: string;
};

/** Build a Lucene-ish query: plain text → name:term* ; keep advanced queries as-is. */
function buildQuery(raw: string): string {
  const q = raw.trim();
  if (!q) return "";
  // User already wrote a field query (name:, set.id:, etc.)
  if (/[:=()]/.test(q)) return q;
  if (q.includes(" ")) {
    const tokens = q.replace(/"/g, "").split(/\s+/).filter(Boolean);
    const collapsed = tokens.join("");
    // Tokens AND (venusaur v → Venusaur V) OR collapsed (mew two → Mewtwo)
    const esc = (t: string) => t.replace(/([+\-&|!(){}\[\]^"~*?:\\/])/g, "\\$1");
    const tokenQuery = tokens.map((t) => `name:${esc(t)}*`).join(" ");
    return `(${tokenQuery} OR name:${esc(collapsed)}*)`;
  }
  const safe = q.replace(/([+\-&|!(){}\[\]^"~*?:\\/])/g, "\\$1");
  return `name:${safe}*`;
}

async function fetchCards(url: string, headers: HeadersInit, attempts = 3): Promise<Response> {
  let last: Response | null = null;
  for (let i = 0; i < attempts; i++) {
    last = await fetch(url, { headers, cache: "no-store" });
    // Transient upstream / Cloudflare errors without API key are common — retry
    if (![500, 502, 503].includes(last.status)) {
      return last;
    }
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  return last!;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") || "").trim();

  if (raw.length < 2) {
    return NextResponse.json({
      cards: [] as TcgSearchCard[],
      message: raw ? "Digite pelo menos 2 caracteres para buscar." : "",
    });
  }

  const q = buildQuery(raw);
  const url = new URL(`${TCG_BASE}/cards`);
  url.searchParams.set("q", q);
  url.searchParams.set("pageSize", String(PAGE_SIZE));
  url.searchParams.set("orderBy", "name");

  const headers: HeadersInit = {
    Accept: "application/json",
    // Undici/default UA is sometimes rejected by Cloudflare in front of the API
    "User-Agent": "Mozilla/5.0 (compatible; PokeCardsBR/0.1; +https://github.com/CoioSpringer/pokemon-cards-mvp)",
  };
  const apiKey = process.env.POKEMONTCG_API_KEY?.trim();
  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  }

  try {
    const res = await fetchCards(url.toString(), headers);

    if (res.status === 429) {
      return NextResponse.json(
        {
          error:
            "Limite de requisições da Pokédex TCG atingido. Aguarde um minuto ou configure POKEMONTCG_API_KEY.",
          cards: [],
        },
        { status: 429 },
      );
    }

    if (!res.ok) {
      console.error("[tcg/search] upstream", res.status, url.toString());
      return NextResponse.json(
        {
          error: `Não foi possível consultar a Pokédex TCG (HTTP ${res.status}). Tente de novo.`,
          cards: [],
        },
        { status: 502 },
      );
    }

    const json = (await res.json()) as {
      data?: Array<{
        id?: string;
        name?: string;
        number?: string;
        rarity?: string;
        artist?: string;
        set?: { id?: string; name?: string };
        images?: { small?: string; large?: string };
      }>;
    };

    const cards: TcgSearchCard[] = (json.data || [])
      .filter((c) => c.id && c.name)
      .map((c) => ({
        id: c.id!,
        name: c.name!,
        number: c.number || "",
        setName: c.set?.name || "",
        setId: c.set?.id || "",
        rarity: c.rarity || "",
        artist: c.artist || "",
        imageSmall: c.images?.small || "",
        imageLarge: c.images?.large || c.images?.small || "",
      }));

    return NextResponse.json({
      cards,
      message: cards.length === 0 ? "Nenhuma carta encontrada. Tente outro nome." : "",
    });
  } catch (e) {
    console.error("[tcg/search] network", e);
    return NextResponse.json(
      {
        error: "Falha de rede ao consultar a Pokédex TCG. Verifique sua conexão.",
        cards: [],
      },
      { status: 502 },
    );
  }
}
