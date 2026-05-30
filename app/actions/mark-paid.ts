"use server";

/**
 * Server Action — mark a commission record as paid.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { commissionRecords } from "@/lib/schema";
import { eq } from "drizzle-orm";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "admin";

export async function markCommissionPaid(formData: FormData) {
  const key = formData.get("adminKey")?.toString() ?? "";
  if (key !== ADMIN_KEY) redirect("/admin?error=unauthorized");

  const id = formData.get("commissionId")?.toString();
  if (!id) redirect(`/admin/commissions?key=${key}&error=missing_id`);

  await db
    .update(commissionRecords)
    .set({ paid: true, paidAt: new Date() })
    .where(eq(commissionRecords.id, id!));

  revalidatePath("/admin/commissions");
  redirect(`/admin/commissions?key=${key}&paid=${id}`);
}
