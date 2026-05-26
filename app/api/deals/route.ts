import { NextRequest, NextResponse } from "next/server";
import { DEALS, searchDeals, getDealsByCategory } from "../../../lib/data";
import type { ApiResponse, Deal } from "../../../lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  let deals: Deal[];

  if (search) {
    deals = searchDeals(search);
  } else if (category) {
    deals = getDealsByCategory(category);
  } else if (featured === "true") {
    deals = DEALS.filter((d) => d.featured && d.status === "active");
  } else {
    deals = DEALS.filter((d) => d.status === "active");
  }

  const response: ApiResponse<Deal[]> = {
    success: true,
    data: deals,
    meta: {
      total: deals.length,
      page: 1,
      limit: deals.length,
    },
  };

  return NextResponse.json(response);
}

// POST is reserved for Phase 2 (Supabase DB)
export async function POST() {
  const response: ApiResponse<null> = {
    success: false,
    error: "Deal submission is not yet available via API. Use the Telegram bot: https://t.me/DealsinKampalaBot",
  };
  return NextResponse.json(response, { status: 501 });
}
