"use server";

/**
 * Server Action — handles new agent applications from /agents/join.
 * Inserts with verified: false so the admin must approve before going live.
 */

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { agents } from "@/lib/schema";

export async function joinAsAgent(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const telegramHandle = formData
    .get("telegramHandle")
    ?.toString()
    .trim()
    .replace(/^@/, "");
  const phone = formData.get("phone")?.toString().trim() || null;
  const altPhone = formData.get("altPhone")?.toString().trim() || null;
  const area = formData.get("area")?.toString().trim();
  const division = formData.get("division")?.toString().trim();
  const landmark = formData.get("landmark")?.toString().trim();
  const mtnNumber = formData.get("mtnNumber")?.toString().trim() || null;
  const airtelNumber = formData.get("airtelNumber")?.toString().trim() || null;

  if (!name || !telegramHandle || !area || !division || !landmark) {
    redirect("/agents/join?error=missing_fields");
  }

  if (!mtnNumber && !airtelNumber) {
    redirect("/agents/join?error=no_mobile_money");
  }

  try {
    await db.insert(agents).values({
      id: `agent-${Date.now()}`,
      name: name!,
      telegramHandle: telegramHandle!,
      phone,
      altPhone,
      area: area!,
      division: division!,
      landmark: landmark!,
      mtnNumber,
      airtelNumber,
      verified: false,  // admin must approve
      active: true,
    });
  } catch (err) {
    console.error("[join-agent] DB insert failed:", err);
    redirect("/agents/join?error=server_error");
  }

  redirect("/agents/join?success=true");
}
