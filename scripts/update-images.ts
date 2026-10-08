import 'dotenv/config';
import { db } from "../src/backend/db";

async function run() {
  const articles = await db.article.findMany();
  console.log('Articles found:', articles.length);
  for (let i = 0; i < articles.length; i++) {
    // Alternance entre les images existantes dans le dossier public
    const img = i % 2 === 0 ? '/fash.jpg' : '/new-hero.png';
    await db.article.update({
      where: { id: articles[i].id },
      data: { images: [img] }
    });
  }
  
  console.log('Done updating images and icons in DB.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
