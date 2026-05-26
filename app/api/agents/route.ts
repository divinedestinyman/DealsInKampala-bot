import { NextRequest, NextResponse } from "next/server";
import { AGENTS, findAgentsByArea } from "../../../lib/agents";
import type { ApiResponse } from "../../../lib/types";
import type { Agent } from "../../../lib/agents";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get("area");
  const verified = searchParams.get("verified");

  let agents: Agent[];

  if (area) {
    agents = findAgentsByArea(area);
  } else if (verified === "true") {
    agents = AGENTS.filter((a) => a.verified);
  } else {
    agents = AGENTS;
  }

  const response: ApiResponse<Agent[]> = {
    success: true,
    data: agents,
    meta: {
      total: agents.length,
      page: 1,
      limit: agents.length,
    },
  };

  return NextResponse.json(response);
}
