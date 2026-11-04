import { NextRequest } from "next/server";
import {
  handleAcademicQueries,
  type AcademicQueryParams,
} from "@/lib/server/academicQueriesProxy";

export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  context: { params: Promise<AcademicQueryParams> },
) {
  return handleAcademicQueries(request, await context.params);
}
