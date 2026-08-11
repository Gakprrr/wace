import { db } from "@/backend/db";

export async function getGlobalStats() {
  const [totalArticles, totalUsers, totalViews, totalLikes, totalComments, newUsersToday] =
    await Promise.all([
      db.article.count(),
      db.user.count(),
      db.article.aggregate({ _sum: { views: true } }),
      db.like.count(),
      db.comment.count(),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

  return {
    totalArticles,
    totalUsers,
    totalViews: totalViews._sum.views ?? 0,
    totalLikes,
    totalComments,
    newUsersToday,
  };
}

export async function getArticleStats() {
  const [mostViewed, mostLiked, mostCommented] = await Promise.all([
    db.article.findMany({
      orderBy: { views: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        views: true,
        price: true,
        images: true,
      },
    }),
    db.article.findMany({
      orderBy: { likes: { _count: "desc" } },
      take: 10,
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        _count: { select: { likes: true } },
      },
    }),
    db.article.findMany({
      orderBy: { comments: { _count: "desc" } },
      take: 10,
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        _count: { select: { comments: true } },
      },
    }),
  ]);

  return { mostViewed, mostLiked, mostCommented };
}

export async function getUserStats() {
  const totalUsers = await db.user.count();
  const activeUsersLast30Days = await db.user.count({
    where: {
      updatedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Registrations per day for the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentUsers = await db.user.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const registrationsByDay: Record<string, number> = {};
  for (const u of recentUsers) {
    const day = u.createdAt.toISOString().split("T")[0];
    registrationsByDay[day] = (registrationsByDay[day] || 0) + 1;
  }

  return {
    totalUsers,
    activeUsersLast30Days,
    registrationsByDay,
  };
}

export async function exportCatalogue() {
  const articles = await db.article.findMany({
    include: {
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV rows
  const headers = [
    "ID",
    "Title",
    "Description",
    "Price",
    "OldPrice",
    "Stock",
    "State",
    "Category",
    "Available",
    "New",
    "Views",
    "CreatedAt",
  ];

  const rows = articles.map((a) => [
    a.id,
    `"${a.title.replace(/"/g, '""')}"`,
    `"${a.description.replace(/"/g, '""')}"`,
    a.price.toString(),
    a.oldPrice?.toString() ?? "",
    a.stock.toString(),
    a.state,
    a.category.name,
    a.isAvailable ? "true" : "false",
    a.isNew ? "true" : "false",
    a.views.toString(),
    a.createdAt.toISOString(),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export async function exportCatalogueExcel() {
  const ExcelJS = require("exceljs");
  const articles = await db.article.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Catalogue");
  sheet.columns = [
    { header: "ID", key: "id", width: 30 },
    { header: "Titre", key: "title", width: 40 },
    { header: "Catégorie", key: "category", width: 20 },
    { header: "Prix", key: "price", width: 15 },
    { header: "Ancien Prix", key: "oldPrice", width: 15 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "État", key: "state", width: 15 },
    { header: "Vues", key: "views", width: 10 },
    { header: "Date de création", key: "createdAt", width: 25 },
  ];

  sheet.getRow(1).font = { bold: true };

  articles.forEach((a) => {
    sheet.addRow({
      id: a.id,
      title: a.title,
      category: a.category.name,
      price: a.price,
      oldPrice: a.oldPrice,
      stock: a.stock,
      state: a.state,
      views: a.views,
      createdAt: a.createdAt,
    });
  });

  return await workbook.xlsx.writeBuffer();
}

export async function exportCataloguePdf() {
  const { jsPDF } = require("jspdf");
  const autoTable = require("jspdf-autotable").default || require("jspdf-autotable");
  const articles = await db.article.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(18);
  doc.text("Catalogue WACE", 14, 22);
  doc.setFontSize(10);
  doc.text(`Généré le : ${new Date().toLocaleDateString("fr-FR")}`, 14, 30);

  const head = [["Titre", "Catégorie", "Prix", "Stock", "État", "Vues", "Date"]];
  const body = articles.map((a) => [
    a.title,
    a.category.name,
    a.price.toString() + " FCFA",
    a.stock.toString(),
    a.state,
    a.views.toString(),
    a.createdAt.toLocaleDateString("fr-FR"),
  ]);

  autoTable(doc, {
    startY: 35,
    head,
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [112, 92, 59] },
  });

  return Buffer.from(doc.output("arraybuffer"));
}
