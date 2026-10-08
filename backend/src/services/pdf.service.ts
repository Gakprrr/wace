import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { db } from "@/db";

export async function generateQrStickersPdf() {
  const articles = await db.article.findMany({
    where: { isAvailable: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 48,
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

  // Page Dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  // Sticker Grid Dimensions: 3 columns x 7 rows per page = 21 stickers per page
  const cols = 3;
  const rows = 7;
  const stickerWidth = (pageWidth - margin * 2) / cols; // ~63.3mm
  const stickerHeight = (pageHeight - margin * 2) / rows; // ~39.5mm

  let currentCol = 0;
  let currentRow = 0;
  let itemsOnPage = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    if (itemsOnPage > 0 && itemsOnPage % (cols * rows) === 0) {
      doc.addPage();
      currentCol = 0;
      currentRow = 0;
      itemsOnPage = 0;
    }

    const x = margin + currentCol * stickerWidth;
    const y = margin + currentRow * stickerHeight;

    // Draw sticker border / container
    doc.setDrawColor(200, 169, 110); // #C8A96E (Or Vintage)
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 1, y + 1, stickerWidth - 2, stickerHeight - 2, 2, 2, "S");

    // Generate QR Code data URL
    const productUrl = `${clientUrl}/catalogue/${article.id}`;
    const qrDataUrl = await QRCode.toDataURL(productUrl, {
      margin: 0,
      width: 150,
      color: { dark: "#1A1A18", light: "#FFFFFF" },
    });

    // Add QR Code Image
    const qrSize = 25;
    doc.addImage(qrDataUrl, "PNG", x + 3, y + (stickerHeight - qrSize) / 2, qrSize, qrSize);

    // Text Information
    const textX = x + qrSize + 5;
    const maxTextWidth = stickerWidth - qrSize - 8;

    // Header WACE
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(112, 92, 59); // #705C3B
    doc.text("WACE • VINTAGE", textX, y + 8);

    // Article Title (Truncated if too long)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(26, 26, 24); // #1A1A18
    const titleLines = doc.splitTextToSize(article.title, maxTextWidth);
    doc.text(titleLines.slice(0, 2), textX, y + 14);

    // Article Price
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(200, 169, 110); // #C8A96E
    doc.text(`${Number(article.price).toLocaleString("fr-FR")} FCFA`, textX, y + 26);

    // State / Condition Badge
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`État: ${article.state.replace("_", " ")}`, textX, y + 31);

    // Grid coordinates increment
    currentCol++;
    if (currentCol >= cols) {
      currentCol = 0;
      currentRow++;
    }
    itemsOnPage++;
  }

  return Buffer.from(doc.output("arraybuffer"));
}
