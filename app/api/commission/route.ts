import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { commissionRecords } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const agentId = new URL(req.url).searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json({ success: false, error: "agentId required" }, { status: 400 });
  }

  try {
    const rows = await db.select().from(commissionRecords).where(eq(commissionRecords.agentTelegramId, agentId));
    const response: ApiResponse<typeof rows> = { success: true, data: rows };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/commission GET]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
