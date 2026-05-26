import { NextRequest, NextResponse } from "next/server";
import { getDealById } from "../../../../lib/data";
import type { ApiResponse, Deal } from "../../../../lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deal = getDealById(id);

  if (!deal) {
    const response: ApiResponse<null> = {
      success: false,
      error: `Deal "${id}" not found`,
    };
    return NextResponse.json(response, { status: 404 });
  }

  const response: ApiResponse<Deal> = {
    success: true,
    data: deal,
  };

  return NextResponse.json(response);
}
