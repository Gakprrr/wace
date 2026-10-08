/**
 * Script de seed — WACE (Wear The Energy)
 * Peuple la base de données avec :
 *  - 1 compte administrateur
 *  - 8 catégories de friperie
 *  - 5 articles de démonstration
 *  - 4 contacts sociaux
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, ItemState } from "@prisma/client";
import bcrypt from "bcryptjs";

// Prisma v7 exige un adaptateur explicite
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Démarrage du seed WACE...\n");

  // ──────────────────────────────────────────────
  // 1. Compte Administrateur
  // ──────────────────────────────────────────────
  console.log("👤 Création du compte administrateur...");
  const adminPassword = await bcrypt.hash("Admin@WACE2024!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@wace.com" },
    update: {},
    create: {
      email: "admin@wace.com",
      password: adminPassword,
      name: "Admin WACE",
      phone: "+22890000000",
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`   ✅ Admin créé : ${admin.email}`);

  // ──────────────────────────────────────────────
  // 2. Compte Client de Test
  // ──────────────────────────────────────────────
  console.log("👤 Création d'un compte client test...");
  const clientPassword = await bcrypt.hash("Client@Test2024!", 12);

  const client = await prisma.user.upsert({
    where: { email: "client@wace.com" },
    update: {},
    create: {
      email: "client@wace.com",
      password: clientPassword,
      name: "Kofi Mensah",
      phone: "+22891234567",
      role: Role.CLIENT,
      isActive: true,
    },
  });
  console.log(`   ✅ Client créé : ${client.email}`);

  // ──────────────────────────────────────────────
  // 3. Catégories de Friperie
  // ──────────────────────────────────────────────
  console.log("\n🏷️  Création des catégories...");

  const categoriesData = [
    { name: "Vêtements Homme", slug: "vetements-homme", icon: "👔" },
    { name: "Vêtements Femme", slug: "vetements-femme", icon: "👗" },
    { name: "Vêtements Enfant", slug: "vetements-enfant", icon: "🧒" },
    { name: "Chaussures", slug: "chaussures", icon: "👟" },
    { name: "Sacs & Accessoires", slug: "sacs-accessoires", icon: "👜" },
    { name: "Sportswear", slug: "sportswear", icon: "⚽" },
    { name: "Vintage & Rétro", slug: "vintage-retro", icon: "🕰️" },
    { name: "Luxe & Marques", slug: "luxe-marques", icon: "✨" },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { icon: cat.icon },
      create: cat,
    });
    categories[cat.slug] = created.id;
    console.log(`   ✅ ${cat.name}`);
  }

  // ──────────────────────────────────────────────
  // 4. Articles de Démonstration
  // ──────────────────────────────────────────────
  console.log("\n📦 Création des articles de démonstration...");

  const articlesData = [
    {
      title: "Jean Brut Coupe Droite — Levi's 501",
      description: "Jean brut classique coupe droite, denim haute qualité 100% coton peigné. Résistant, confortable et intemporel.",
      price: 6500,
      oldPrice: 15000,
      stock: 3,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/Jean1.jpg"],
      isNew: true,
      isAvailable: true,
      views: 142,
    },
    {
      title: "Jean Denim Vintage Délavé 90s",
      description: "Jean coupe vintage au style authentique des années 90, délavage naturel subtil aux cuisses. Pièce rétro unique.",
      price: 7000,
      oldPrice: 16000,
      stock: 2,
      state: ItemState.USE_VINTAGE,
      categorySlug: "vintage-retro",
      images: ["/images/Jean2.jpg"],
      isNew: false,
      isAvailable: true,
      views: 98,
    },
    {
      title: "Jean Slim Femme Bleu Marine",
      description: "Jean slim ajusté pour femme bleu sombre, coupe moderne parfaite pour une silhouette élancée.",
      price: 6000,
      oldPrice: 12000,
      stock: 4,
      state: ItemState.BON_ETAT,
      categorySlug: "vetements-femme",
      images: ["/images/Jean3.jpg"],
      isNew: false,
      isAvailable: true,
      views: 185,
    },
    {
      title: "Jean Regular Coton Bio WACE",
      description: "Jean coupe classique regular en coton biologique souple, surpiqûres dorées soignées.",
      price: 5500,
      oldPrice: 10000,
      stock: 5,
      state: ItemState.NEUF,
      categorySlug: "vetements-homme",
      images: ["/images/Jean4.jpg"],
      isNew: true,
      isAvailable: true,
      views: 210,
    },
    {
      title: "Jean Noir Casual Urban",
      description: "Jean noir profond, coupe moderne passe-partout idéale pour assortir avec toutes vos tenues.",
      price: 6000,
      oldPrice: 14000,
      stock: 3,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/Jean5.jpg"],
      isNew: false,
      isAvailable: true,
      views: 156,
    },
    {
      title: "Jean Délavé Style Streetwear",
      description: "Jean streetwear délavé aux genoux avec effets d'usure contrôlés. Look urbain et tendance.",
      price: 7500,
      oldPrice: 18000,
      stock: 2,
      state: ItemState.BON_ETAT,
      categorySlug: "sportswear",
      images: ["/images/Jean6.jpg"],
      isNew: false,
      isAvailable: true,
      views: 320,
    },
    {
      title: "Jean Bleu Ciel Confort Femme",
      description: "Jean bleu ciel léger et respirant pour femme en denim souple, parfait pour l'été.",
      price: 5000,
      oldPrice: 11000,
      stock: 3,
      state: ItemState.BON_ETAT,
      categorySlug: "vetements-femme",
      images: ["/images/jean7.jpg"],
      isNew: false,
      isAvailable: true,
      views: 115,
    },
    {
      title: "Jean Classic Fit Stonewash",
      description: "Jean coupe droite finition stonewash. Solidité remarquable et grand confort de mouvement.",
      price: 5800,
      oldPrice: 13000,
      stock: 4,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/jean8.jpg"],
      isNew: false,
      isAvailable: true,
      views: 140,
    },
    {
      title: "Jean Indigo Selvedge Premium",
      description: "Jean d'exception en toile indigo selvedge japonaise brute haut de gamme. Coupe ajustée impeccable.",
      price: 12000,
      oldPrice: 30000,
      stock: 1,
      state: ItemState.NEUF,
      categorySlug: "luxe-marques",
      images: ["/images/jean9.jpg"],
      isNew: true,
      isAvailable: true,
      views: 450,
    },
    {
      title: "Pantalon Cargo Tactique Olive",
      description: "Pantalon cargo vert olive multipoches en toile renforcée de qualité militaire. Look utilitaire et résistant.",
      price: 8500,
      oldPrice: 18000,
      stock: 3,
      state: ItemState.NEUF,
      categorySlug: "sportswear",
      images: ["/images/cargopantalon.jpg"],
      isNew: true,
      isAvailable: true,
      views: 290,
    },
    {
      title: "Short Denim Bermuda Casual",
      description: "Bermuda en jean bleu coupe décontractée avec revers ajustables. Confortable et robuste.",
      price: 4000,
      oldPrice: 9000,
      stock: 4,
      state: ItemState.BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/cullote.jpg"],
      isNew: false,
      isAvailable: true,
      views: 130,
    },
    {
      title: "Short Chic Ajusté WACE Lady",
      description: "Short élégant taille haute pour femme, coupe cintrée et matière fluide très agréable à porter.",
      price: 4500,
      oldPrice: 10000,
      stock: 2,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-femme",
      images: ["/images/cullote2.jpg"],
      isNew: false,
      isAvailable: true,
      views: 175,
    },
    {
      title: "Chemise Coton Oxford Bleue",
      description: "Chemise Oxford homme en coton peigné bleu ciel, coupe soignée idéale pour le travail et le quotidien.",
      price: 4500,
      oldPrice: 10000,
      stock: 3,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/chemise1.jpg"],
      isNew: true,
      isAvailable: true,
      views: 240,
    },
    {
      title: "Chemise Rayée Business Casual",
      description: "Chemise à fines rayures verticales bleu/blanc, col rigide élégant. Style professionnel moderne.",
      price: 5000,
      oldPrice: 12000,
      stock: 4,
      state: ItemState.NEUF,
      categorySlug: "vetements-homme",
      images: ["/images/chemise2.jpg.jpg"],
      isNew: true,
      isAvailable: true,
      views: 195,
    },
    {
      title: "Chemise Manches Longues Élégance",
      description: "Chemise homme manches longues coupe ajustée slim fit en popeline de coton haute précision.",
      price: 5500,
      oldPrice: 13000,
      stock: 2,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/chemise3manchelongue.jpg"],
      isNew: false,
      isAvailable: true,
      views: 160,
    },
    {
      title: "Chemise Blanche Classique Premium",
      description: "Intemporelle chemise blanche en pur coton, finitions impeccables et boutons nacrés.",
      price: 4800,
      oldPrice: 11000,
      stock: 5,
      state: ItemState.NEUF,
      categorySlug: "vetements-homme",
      images: ["/images/chemise4.jpg"],
      isNew: true,
      isAvailable: true,
      views: 310,
    },
    {
      title: "Chemise Motif Vintage Retro 80s",
      description: "Chemise originale aux motifs imprimés vintage des années 80, pièce unique de friperie sélective.",
      price: 6500,
      oldPrice: 14000,
      stock: 1,
      state: ItemState.USE_VINTAGE,
      categorySlug: "vintage-retro",
      images: ["/images/chemise5.jpg"],
      isNew: false,
      isAvailable: true,
      views: 220,
    },
    {
      title: "Chemise Carreaux Tartan Flanelle",
      description: "Chemise chaude en flanelle de coton doux à motif tartan rouge et noir, idéale en superposition.",
      price: 5200,
      oldPrice: 12500,
      stock: 3,
      state: ItemState.BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/chemise6.jpg"],
      isNew: false,
      isAvailable: true,
      views: 180,
    },
    {
      title: "Chemise en Lin Écrus Été",
      description: "Chemise estivale en lin 100% naturel respirant et léger, col mao tendance.",
      price: 6000,
      oldPrice: 15000,
      stock: 2,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/chemise7.jpg"],
      isNew: false,
      isAvailable: true,
      views: 260,
    },
    {
      title: "Chemise Soyeuse Satinée Dame",
      description: "Chemise femme fluide au toucher satiné, décolleté élégant et tombé impeccable pour les soirées.",
      price: 5500,
      oldPrice: 13000,
      stock: 3,
      state: ItemState.NEUF,
      categorySlug: "vetements-femme",
      images: ["/images/chemisedame.jpg"],
      isNew: true,
      isAvailable: true,
      views: 340,
    },
    {
      title: "Chemise Ajustée Dame Chic",
      description: "Chemise cintrée pour femme avec finitions soignées et boutons dorés. Élégance garantie.",
      price: 5800,
      oldPrice: 14000,
      stock: 2,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-femme",
      images: ["/images/chemisedame2.jpg"],
      isNew: false,
      isAvailable: true,
      views: 210,
    },
    {
      title: "Pullover Coton Doux Col Rond",
      description: "Pull maille fine col rond en coton peigné, couleur naturelle chaleureuse et agréable au toucher.",
      price: 6000,
      oldPrice: 14000,
      stock: 4,
      state: ItemState.BON_ETAT,
      categorySlug: "vetements-homme",
      images: ["/images/pullover.jpg"],
      isNew: false,
      isAvailable: true,
      views: 170,
    },
    {
      title: "Pull Torsadé Mailles Laine Vintage",
      description: "Pull vintage torsadé en laine épaisse, style rétro d'hiver très chaud et douillet.",
      price: 7500,
      oldPrice: 17000,
      stock: 1,
      state: ItemState.USE_VINTAGE,
      categorySlug: "vintage-retro",
      images: ["/images/pullover2.jpg"],
      isNew: false,
      isAvailable: true,
      views: 285,
    },
    {
      title: "Hoodie Sweat à Capuche Streetwear",
      description: "Sweat molletonné à capuche coupe oversize décontractée avec poche kangourou et cordons ajustables.",
      price: 7000,
      oldPrice: 15000,
      stock: 3,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "sportswear",
      images: ["/images/pullovercapuche.jpg"],
      isNew: false,
      isAvailable: true,
      views: 390,
    },
    {
      title: "Hoodie Urban Black Edition",
      description: "Sweat noir mat à capuche en coton lourd haut de gamme, style minimaliste streetwear contemporain.",
      price: 7500,
      oldPrice: 16000,
      stock: 4,
      state: ItemState.NEUF,
      categorySlug: "sportswear",
      images: ["/images/pullovercapuche2.jpg"],
      isNew: true,
      isAvailable: true,
      views: 410,
    },
    {
      title: "Veste Sans Manche Matelassée",
      description: "Doudoune sans manche matelassée légère et déperlante, idéale en superposition par temps frais.",
      price: 8000,
      oldPrice: 18000,
      stock: 2,
      state: ItemState.NEUF,
      categorySlug: "sportswear",
      images: ["/images/SansManche.jpg"],
      isNew: true,
      isAvailable: true,
      views: 275,
    },
    {
      title: "Doudoune Sans Manche Urban Sport",
      description: "Gilet sans manche rembourré thermique avec col montant et fermetures éclair étanches.",
      price: 8500,
      oldPrice: 19000,
      stock: 3,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "sportswear",
      images: ["/images/sansmanche2.jpg"],
      isNew: false,
      isAvailable: true,
      views: 230,
    },
    {
      title: "Veste Doudoune SnowStar Winter",
      description: "Veste doudoune d'hiver haute performance SnowStar, isolation thermique renforcée et capuche amovible.",
      price: 15000,
      oldPrice: 35000,
      stock: 1,
      state: ItemState.NEUF,
      categorySlug: "luxe-marques",
      images: ["/images/SNOWSTAR.jpg"],
      isNew: true,
      isAvailable: true,
      views: 520,
    },
  ];

  for (const art of articlesData) {
    const { categorySlug, oldPrice, ...rest } = art;
    const categoryId = categories[categorySlug];
    if (!categoryId) continue;

    const existing = await prisma.article.findFirst({
      where: { title: art.title },
    });

    if (!existing) {
      const created = await prisma.article.create({
        data: {
          ...rest,
          price: rest.price,
          oldPrice: oldPrice ?? undefined,
          categoryId,
        },
      });
      console.log(`   ✅ ${created.title}`);
    } else {
      await prisma.article.update({
        where: { id: existing.id },
        data: {
          ...rest,
          price: rest.price,
          oldPrice: oldPrice ?? undefined,
          categoryId,
        },
      });
      console.log(`   🔄 Mis à jour : ${art.title}`);
    }
  }

  // ──────────────────────────────────────────────
  // 5. Contacts Sociaux de l'Admin
  // ──────────────────────────────────────────────
  console.log("\n📱 Création des contacts sociaux...");

  const contactsData = [
    {
      platform: "whatsapp",
      label: "WhatsApp WACE",
      url: "https://wa.me/22870156109",
      icon: "💬",
      isActive: true,
      order: 1,
    },
    {
      platform: "instagram",
      label: "@WACE_district",
      url: "https://instagram.com/WACE_district",
      icon: "📸",
      isActive: true,
      order: 2,
    },
    {
      platform: "facebook",
      label: "WACE_district",
      url: "https://facebook.com/WACE_district",
      icon: "👍",
      isActive: true,
      order: 3,
    },
    {
      platform: "tiktok",
      label: "@WACE_district",
      url: "https://tiktok.com/@WACE_district",
      icon: "🎵",
      isActive: true,
      order: 4,
    },
    {
      platform: "phone",
      label: "+228 70 15 61 09",
      url: "tel:+22870156109",
      icon: "📞",
      isActive: true,
      order: 5,
    },
  ];

  for (const contact of contactsData) {
    const existing = await prisma.socialContact.findFirst({
      where: { platform: contact.platform },
    });
    if (existing) {
      await prisma.socialContact.update({
        where: { id: existing.id },
        data: contact,
      });
      console.log(`   ✅ Mis à jour : ${contact.platform} — ${contact.label}`);
    } else {
      await prisma.socialContact.create({
        data: contact,
      });
      console.log(`   ✅ Créé : ${contact.platform} — ${contact.label}`);
    }
  }

  // ──────────────────────────────────────────────
  // Résumé
  // ──────────────────────────────────────────────
  const userCount = await prisma.user.count();
  const catCount = await prisma.category.count();
  const artCount = await prisma.article.count();
  const contactCount = await prisma.socialContact.count();

  console.log("\n✨ Seed terminé avec succès !\n");
  console.log("📊 Résumé de la base de données :");
  console.log(`   👥 Utilisateurs  : ${userCount}`);
  console.log(`   🏷️  Catégories   : ${catCount}`);
  console.log(`   📦 Articles      : ${artCount}`);
  console.log(`   📱 Contacts      : ${contactCount}`);
  console.log("\n🔐 Identifiants Admin  : admin@wace.com  (voir .env ou documentation interne)");
  console.log("🧑 Identifiants Client : client@wace.com (voir .env ou documentation interne)");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
