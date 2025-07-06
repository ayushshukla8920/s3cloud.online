import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function updateSubdomainCounts() {
  const users = await prisma.user.findMany({
    include: {
      subdomains: true,
    },
  });

  for (const user of users) {
    const count = user.subdomains.length;

    await prisma.user.update({
      where: { id: user.id },
      data: { subdomainCount: count },
    });

    console.log(`Updated ${user.email} -> ${count} subdomains`);
  }

  await prisma.$disconnect();
}

updateSubdomainCounts().catch((err) => {
  console.error(err);
  process.exit(1);
});
