"use server";

/**
 * Admin Server Actions — approve, reject, feature deals; verify/reject agents.
 * All actions verify the ADMIN_KEY env var before mutating anything.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { deals, agents } from "@/lib/schema";
import { eq } from "drizzle-orm";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "admin";

function verifyKey(formData: FormData): string {
  const key = formData.get("adminKey")?.toString() ?? "";
  if (key !== ADMIN_KEY) redirect("/admin?error=unauthorized");
  return key;
}

// ─── Deal actions ─────────────────────────────────────────────────────────────

export async function approveDeal(formData: FormData) {
  const key = verifyKey(formData);
  const id = formData.get("dealId")?.toString();
  if (!id) redirect(`/admin?key=${key}&error=missing_id`);

  await db
    .update(deals)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(deals.id, id!));

  revalidatePath("/admin");
  revalidatePath("/deals");
  redirect(`/admin?key=${key}&approved=${id}`);
}

export async function rejectDeal(formData: FormData) {
  const key = verifyKey(formData);
  const id = formData.get("dealId")?.toString();
  if (!id) redirect(`/admin?key=${key}&error=missing_id`);

  await db
    .update(deals)
    .set({ status: "expired", updatedAt: new Date() })
    .where(eq(deals.id, id!));

  revalidatePath("/admin");
  revalidatePath("/deals");
  redirect(`/admin?key=${key}&rejected=${id}`);
}

export async function featureDeal(formData: FormData) {
  const key = verifyKey(formData);
  const id = formData.get("dealId")?.toString();
  const featured = formData.get("featured")?.toString() === "true";
  if (!id) redirect(`/admin?key=${key}&error=missing_id`);

  await db
    .update(deals)
    .set({ featured, updatedAt: new Date() })
    .where(eq(deals.id, id!));

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/admin?key=${key}&featured=${id}`);
}

// ─── Agent actions ────────────────────────────────────────────────────────────

export async function verifyAgent(formData: FormData) {
  const key = verifyKey(formData);
  const id = formData.get("agentId")?.toString();
  if (!id) redirect(`/admin?key=${key}&error=missing_id`);

  await db
    .update(agents)
    .set({ verified: true })
    .where(eq(agents.id, id!));

  revalidatePath("/admin");
  revalidatePath("/agents");
  redirect(`/admin?key=${key}&verified=${id}`);
}

export async function rejectAgent(formData: FormData) {
  const key = verifyKey(formData);
  const id = formData.get("agentId")?.toString();
  if (!id) redirect(`/admin?key=${key}&error=missing_id`);

  // Soft-delete: mark inactive so they can re-apply later
  await db
    .update(agents)
    .set({ active: false })
    .where(eq(agents.id, id!));

  revalidatePath("/admin");
  redirect(`/admin?key=${key}&rejected_agent=${id}`);
}
