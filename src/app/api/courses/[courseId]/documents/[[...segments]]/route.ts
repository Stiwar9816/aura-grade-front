import { NextRequest } from "next/server";
import {
  handleCourseDocuments,
  type LibraryRouteParams,
} from "@/lib/server/courseDocumentsProxy";

export const runtime = "nodejs";
type Context = { params: Promise<LibraryRouteParams> };
export async function GET(request: NextRequest, context: Context) {
  return handleCourseDocuments(request, await context.params, "GET");
}
export async function POST(request: NextRequest, context: Context) {
  return handleCourseDocuments(request, await context.params, "POST");
}
