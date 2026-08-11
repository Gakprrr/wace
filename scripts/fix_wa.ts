import { db } from "../src/backend/db";

async function main() {
  const updated = await db.socialContact.updateMany({
    where: { platform: 'whatsapp' },
    data: {
      label: 'Contact'
    }
  });
  console.log('Updated contacts:', updated);
}

main()
  .catch(e => console.error(e))
  .finally(() => db.$disconnect());
