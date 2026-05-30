import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { escrowRequests } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const required = ["dealId", "dealTitle", "buyerName", "buyerPhone", "sellerName", "sellerTelegram"];
  const missing = required.filter((k) => !input[k]);

  if (missing.length > 0) {
    return NextResponse.json({ success: false, error: `Missing: ${missing.join(", ")}` }, { status: 400 });
  }

  try {
    const [created] = await db
      .insert(escrowRequests)
      .values({
        id: `escrow-${Date.now()}`,
        dealId: String(input.dealId),
        dealTitle: String(input.dealTitle),
        buyerName: String(input.buyerName),
        buyerPhone: String(input.buyerPhone),
        buyerTelegram: input.buyerTelegram ? String(input.buyerTelegram) : null,
        sellerName: String(input.sellerName),
        sellerTelegram: String(input.sellerTelegram),
        status: "requested",
      })
      .returning();

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("[/api/escrow POST]", err);
    return NextResponse.json({ success: false, error: "Failed to create escrow" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const dealId = new URL(req.url).searchParams.get("dealId");

  if (!dealId) {
    return NextResponse.json({ success: false, error: "dealId required" }, { status: 400 });
  }

  try {
    const rows = await db.select().from(escrowRequests).where(eq(escrowRequests.dealId, dealId));
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("[/api/escrow GET]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { escrowId, status, agentTelegramId } = body as Record<string, unknown>;

  if (!escrowId || !status) {
    return NextResponse.json({ success: false, error: "Missing escrowId/status" }, { status: 400 });
  }

  try {
    const [updated] = await db
      .update(escrowRequests)
      .set({
        status: String(status) as any,
        agentTelegramId: agentTelegramId ? String(agentTelegramId) : undefined,
        completedAt: status === "completed" ? new Date() : undefined,
      })
      .where(eq(escrowRequests.id, String(escrowId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[/api/escrow PATCH]", err);
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
