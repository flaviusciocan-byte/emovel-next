import { handlePdfExport } from "../../../../lib/exports/pdf-api";

export async function POST(request: Request) {
  return handlePdfExport(request);
}
