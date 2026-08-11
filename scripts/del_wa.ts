import { db } from "../src/backend/db";

async function main() {
  const deleted = await db.socialContact.deleteMany({
    where: { platform: 'whatsapp' }
  });
  console.log('Deleted contacts:', deleted);
  
  const remaining = await db.socialContact.findMany();
  console.log('Remaining contacts:', remaining);
}

main()
  .catch(e => console.error(e))
  .finally(() => db.$disconnect());
