import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const inquiries = [
  {
    name: "Jordan Avery",
    email: "jordan.avery@example.com",
    phone: "212-555-0144",
    inquiryType: "SHORT_TERM" as const,
    message:
      "Relocating for a 3-month project and looking for a furnished 1-bed in Hell's Kitchen starting next month.",
  },
  {
    name: "Priya Nair",
    email: "priya.nair@example.com",
    inquiryType: "CORPORATE" as const,
    company: "Northwind Productions",
    message:
      "We need corporate housing for 4 crew members for an upcoming production. Can you share availability?",
  },
];

async function main() {
  await prisma.contactInquiry.deleteMany();
  for (const data of inquiries) {
    await prisma.contactInquiry.create({ data });
  }
  console.log(`Seeded ${inquiries.length} contact inquiries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
