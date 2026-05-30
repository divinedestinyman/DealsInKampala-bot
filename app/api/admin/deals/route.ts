import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deals } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const telegramId = req.headers.get("x-admin-telegram-id");
  const adminId = process.env.ADMIN_TELEGRAM_ID;

  if (!adminId || telegramId !== adminId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const rows = await db
      .select()
      .from(deals)
      .where(eq(deals.status, "pending"))
      .orderBy(deals.createdAt);

    const response: ApiResponse<typeof rows> = {
      success: true,
      data: rows,
      meta: { total: rows.length, page: 1, limit: rows.length },
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/admin/deals GET]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending deals" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const telegramId = req.headers.get("x-admin-telegram-id");
  const adminId = process.env.ADMIN_TELEGRAM_ID;

  if (!adminId || telegramId !== adminId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { dealId, status } = body as { dealId?: string; status?: string };

  if (!dealId || !["active", "rejected"].includes(status || "")) {
    return NextResponse.json(
      { success: false, error: "Missing or invalid dealId/status" },
      { status: 400 }
    );
  }

  try {
    const validStatus = status as "active" | "rejected";
    const [updated] = await db
      .update(deals)
      .set({
        status: validStatus,
        updatedAt: new Date(),
      })
      .where(eq(deals.id, dealId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Deal not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof updated> = { success: true, data: updated };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[/api/admin/deals PATCH]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update deal" },
      { status: 500 }
    );
  }
}
