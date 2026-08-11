import { NextResponse } from "next/server";
import { exportCatalogue, exportCatalogueExcel, exportCataloguePdf } from "@/backend/services/stats.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const url = new URL(request.url);
    const format = url.searchParams.get("format");

    if (format === "excel") {
      const buffer = await exportCatalogueExcel();
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="wace_catalogue.xlsx"',
        },
      });
    }

    if (format === "pdf") {
      const buffer = await exportCataloguePdf();
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="wace_catalogue.pdf"',
        },
      });
    }

    const csvContent = await exportCatalogue();
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="wace_catalogue.csv"',
      },
    });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
