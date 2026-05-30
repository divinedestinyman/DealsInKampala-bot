import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/schema";
import type { ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;
  const required = ["name", "area", "division", "landmark", "telegramHandle"];
  const missing = required.filter((k) => !input[k]);

  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `Missing: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const [created] = await db
      .insert(agents)
      .values({
        id: `agent-${Date.now()}`,
        name: String(input.name),
        telegramHandle: String(input.telegramHandle).replace(/^@/, ""),
        phone: input.phone ? String(input.phone) : null,
        altPhone: input.altPhone ? String(input.altPhone) : null,
        area: String(input.area),
        division: String(input.division),
        landmark: String(input.landmark),
        verified: false,
        active: true,
      })
      .returning();

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("[/api/agents POST]", err);
    return NextResponse.json(
      { success: false, error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
