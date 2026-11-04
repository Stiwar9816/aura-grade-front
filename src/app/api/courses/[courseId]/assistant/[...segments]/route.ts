import { NextRequest } from "next/server";
import {
  handleCourseAssistant,
  type AssistantParams,
} from "@/lib/server/courseAssistantProxy";
export const runtime = "nodejs";
export async function GET(
  request: NextRequest,
  context: { params: Promise<AssistantParams> },
) {
  return handleCourseAssistant(request, await context.params);
}
export const POST = GET;
