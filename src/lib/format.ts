export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export const CONDITION_LABELS: Record<string, string> = {
  NM: "NM — Near Mint",
  LP: "LP — Little Played",
  MP: "MP — Moderately Played",
  HP: "HP — Heavily Played",
};

export const MODE_LABELS: Record<string, string> = {
  HAVE: "Tenho (vendo)",
  WANT: "Quero (procuro)",
};

export function placeholderCardImage(name: string) {
  const q = encodeURIComponent(name || "pokemon");
  return `https://placehold.co/400x560/1e293b/f8fafc?text=${q}`;
}
