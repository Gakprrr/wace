import { db } from "../src/backend/db";

async function main() {
  const added = await db.socialContact.create({
    data: {
      platform: 'whatsapp',
      label: 'WhatsApp',
      url: 'https://wa.me/22890383389',
      isActive: true,
      icon: '💬',
      order: 1
    }
  });
  console.log('Added contact:', added);
}

main()
  .catch(e => console.error(e))
  .finally(() => db.$disconnect());
