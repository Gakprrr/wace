const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.socialContact.deleteMany({
    where: { platform: 'whatsapp' }
  });
  console.log('Deleted contacts:', deleted);
  
  const remaining = await prisma.socialContact.findMany();
  console.log('Remaining contacts:', remaining);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
