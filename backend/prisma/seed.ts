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
      title: "Chemise Oxford Bleue — Ralph Lauren",
      description:
        "Chemise Oxford authentique Ralph Lauren, taille M. Couleur bleu ciel, légèrement portée, excellente qualité. Parfaite pour un look business casual ou décontracté.",
      price: 3500,
      oldPrice: 8000,
      stock: 1,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "vetements-homme",
      images: [
        "https://images.unsplash.com/photo-1602810319250-a663f0af2f75?w=600",
      ],
      isNew: true,
      isAvailable: true,
      views: 42,
    },
    {
      title: "Robe Florale Zara — Taille S",
      description:
        "Jolie robe florale Zara, taille S. Tissu léger, parfaite pour l'été. Portée 2-3 fois, comme neuve. Longueur mi-jambe.",
      price: 4000,
      oldPrice: 12000,
      stock: 1,
      state: ItemState.BON_ETAT,
      categorySlug: "vetements-femme",
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
      ],
      isNew: false,
      isAvailable: true,
      views: 87,
    },
    {
      title: "Basket Nike Air Max 270 — Pointure 42",
      description:
        "Nike Air Max 270 originales, pointure 42. Coloris blanc/noir. Légèrement usées aux semelles, dessus en excellent état. Avec boîte d'origine.",
      price: 15000,
      oldPrice: 35000,
      stock: 1,
      state: ItemState.BON_ETAT,
      categorySlug: "chaussures",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      ],
      isNew: false,
      isAvailable: true,
      views: 215,
    },
    {
      title: "Veste Jeans Levi's Vintage",
      description:
        "Veste en jean Levi's vintage années 90. Taille L (unisexe). Patine naturelle authentique, boutons originaux. Un classique indémodable.",
      price: 8500,
      oldPrice: null,
      stock: 1,
      state: ItemState.USE_VINTAGE,
      categorySlug: "vintage-retro",
      images: [
        "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600",
      ],
      isNew: false,
      isAvailable: true,
      views: 133,
    },
    {
      title: "Sac à Main Michael Kors — Cuir Marron",
      description:
        "Sac à main Michael Kors en cuir véritable, couleur cognac. Fermeture éclair, bandoulière amovible. Légères marques d'usure, intérieur propre.",
      price: 22000,
      oldPrice: 65000,
      stock: 1,
      state: ItemState.TRES_BON_ETAT,
      categorySlug: "sacs-accessoires",
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600",
      ],
      isNew: true,
      isAvailable: true,
      views: 301,
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
      console.log(`   ⏭️  Article déjà existant : ${art.title}`);
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
      url: "https://wa.me/22890383389",
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
      label: "+228 90383389",
      url: "tel:+22890383389",
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
