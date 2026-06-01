import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const items = [
  { name: "Lakeside Villa", description: "4-bed waterfront home with a private dock." },
  { name: "Downtown Loft", description: "Open-plan loft in the arts district." },
  { name: "Suburban Bungalow", description: "Cozy 3-bed with a large backyard." },
];

async function main() {
  await prisma.item.deleteMany();
  for (const data of items) {
    await prisma.item.create({ data });
  }
  console.log(`Seeded ${items.length} items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
