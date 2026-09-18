import { PrismaClient, Condition, ListingMode } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.portfolioCard.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const demo = await prisma.user.create({
    data: {
      email: "demo@pokemon.local",
      name: "Demo Colecionador",
      passwordHash,
    },
  });

  const maria = await prisma.user.create({
    data: {
      email: "maria@pokemon.local",
      name: "Maria Silva",
      passwordHash,
    },
  });

  const joao = await prisma.user.create({
    data: {
      email: "joao@pokemon.local",
      name: "João Santos",
      passwordHash,
    },
  });

  const demoCards = await Promise.all([
    prisma.portfolioCard.create({
      data: {
        userId: demo.id,
        name: "Charizard ex",
        set: "Obsidian Flames",
        condition: Condition.NM,
        priceBRL: 450,
        notes: "Carta principal da coleção",
        photoUrl: "https://images.pokemontcg.io/sv3/125_hires.png",
      },
    }),
    prisma.portfolioCard.create({
      data: {
        userId: demo.id,
        name: "Pikachu VMAX",
        set: "Vivid Voltage",
        condition: Condition.LP,
        priceBRL: 180,
        notes: "Cantos levemente usados",
        photoUrl: "https://images.pokemontcg.io/swsh4/44_hires.png",
      },
    }),
    prisma.portfolioCard.create({
      data: {
        userId: demo.id,
        name: "Mewtwo VSTAR",
        set: "Pokémon GO",
        condition: Condition.NM,
        priceBRL: 95,
        photoUrl: "https://images.pokemontcg.io/pgo/31_hires.png",
      },
    }),
  ]);

  await prisma.portfolioCard.create({
    data: {
      userId: maria.id,
      name: "Umbreon VMAX",
      set: "Evolving Skies",
      condition: Condition.NM,
      priceBRL: 620,
      photoUrl: "https://images.pokemontcg.io/swsh7/95_hires.png",
    },
  });

  await prisma.listing.createMany({
    data: [
      {
        userId: demo.id,
        portfolioCardId: demoCards[0].id,
        mode: ListingMode.HAVE,
        name: "Charizard ex",
        set: "Obsidian Flames",
        condition: Condition.NM,
        priceBRL: 450,
        notes: "Aceito troca por Umbreon",
        photoUrl: "https://images.pokemontcg.io/sv3/125_hires.png",
      },
      {
        userId: demo.id,
        portfolioCardId: demoCards[1].id,
        mode: ListingMode.HAVE,
        name: "Pikachu VMAX",
        set: "Vivid Voltage",
        condition: Condition.LP,
        priceBRL: 180,
        notes: "Envio para todo o Brasil (combinar)",
        photoUrl: "https://images.pokemontcg.io/swsh4/44_hires.png",
      },
      {
        userId: demo.id,
        mode: ListingMode.WANT,
        name: "Rayquaza VMAX",
        set: "Evolving Skies",
        condition: Condition.NM,
        priceBRL: 350,
        notes: "Procuro NM, preferência alt art",
        photoUrl: "https://images.pokemontcg.io/swsh7/111_hires.png",
      },
      {
        userId: maria.id,
        mode: ListingMode.HAVE,
        name: "Umbreon VMAX",
        set: "Evolving Skies",
        condition: Condition.NM,
        priceBRL: 620,
        notes: "Alt art, bem conservada",
        photoUrl: "https://images.pokemontcg.io/swsh7/95_hires.png",
      },
      {
        userId: maria.id,
        mode: ListingMode.WANT,
        name: "Giratina VSTAR",
        set: "Lost Origin",
        condition: Condition.LP,
        priceBRL: 200,
        notes: "Aceito LP",
        photoUrl: "https://images.pokemontcg.io/swsh11/130_hires.png",
      },
      {
        userId: joao.id,
        mode: ListingMode.HAVE,
        name: "Lugia VSTAR",
        set: "Silver Tempest",
        condition: Condition.MP,
        priceBRL: 140,
        notes: "Marcas de uso na borda",
        photoUrl: "https://images.pokemontcg.io/swsh12/139_hires.png",
      },
      {
        userId: joao.id,
        mode: ListingMode.WANT,
        name: "Charizard ex",
        set: "Obsidian Flames",
        condition: Condition.NM,
        priceBRL: 400,
        notes: "Quero completar o set",
        photoUrl: "https://images.pokemontcg.io/sv3/125_hires.png",
      },
      {
        userId: joao.id,
        mode: ListingMode.HAVE,
        name: "Gardevoir ex",
        set: "Scarlet & Violet",
        condition: Condition.NM,
        priceBRL: 85,
        photoUrl: "https://images.pokemontcg.io/sv1/86_hires.png",
      },
    ],
  });

  console.log("Seed OK");
  console.log("Demo login: demo@pokemon.local / demo1234");
  console.log("Also: maria@pokemon.local / demo1234 , joao@pokemon.local / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
