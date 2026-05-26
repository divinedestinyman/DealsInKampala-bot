import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, CommissionRecord } from "../../../lib/types";

export const dynamic = "force-dynamic";

// n8n POSTs here when a deal closes via the Agent Commission Tracker workflow.
// Validates the shared webhook secret, then logs the record.
// Phase 2: persist to Supabase instead of console.log.
export async function POST(req: NextRequest) {
  // Verify webhook secret so only n8n can call this
  const secret = req.headers.get("x-webhook-secret");
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Unauthorized",
    };
    return NextResponse.json(response, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    const response: ApiResponse<null> = {
      success: false,
      error: "Invalid JSON body",
    };
    return NextResponse.json(response, { status: 400 });
  }

  // Validate required fields
  const record = body as Partial<CommissionRecord>;
  const required: (keyof CommissionRecord)[] = [
    "agentTelegramId",
    "agentName",
    "buyerName",
    "sellerName",
    "amountUgx",
    "dealDescription",
    "dealId",
    "dealType",
  ];

  const missing = required.filter((k) => !record[k]);
  if (missing.length > 0) {
    const response: ApiResponse<null> = {
      success: false,
      error: `Missing required fields: ${missing.join(", ")}`,
    };
    return NextResponse.json(response, { status: 400 });
  }

  // Calculate commission split
  const dealType = record.dealType!;
  const amount = record.amountUgx!;
  const agentCommissionPct = 0.01; // 1% always
  const africaTeamPct = dealType === "standard" ? 0.01 : 0.05; // 1% or 5%

  const agentCommission = Math.round(amount * agentCommissionPct);
  const africaTeamCommission = Math.round(amount * africaTeamPct);
  const totalCommission = agentCommission + africaTeamCommission;

  const logEntry = {
    ...record,
    agentCommissionUgx: agentCommission,
    africaTeamCommissionUgx: africaTeamCommission,
    totalCommissionUgx: totalCommission,
    recordedAt: new Date().toISOString(),
  };

  // Phase 1: log to console (visible in Vercel Function logs)
  // Phase 2: INSERT INTO supabase commission_records table
  console.log("[Commission]", JSON.stringify(logEntry));

  const response: ApiResponse<typeof logEntry> = {
    success: true,
    data: logEntry,
  };

  return NextResponse.json(response, { status: 201 });
}

// Health check for n8n workflow testing
export async function GET() {
  return NextResponse.json({
    success: true,
    data: { status: "Commission endpoint active", version: "1.0.0" },
  });
}
