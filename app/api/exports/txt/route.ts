import { handleTextExport } from "../../../../lib/exports/api";

export async function POST(request: Request) {
  return handleTextExport(request, "txt");
}
