"use server";

/**
 * Server Action — handles deal submission from the web form.
 * Validates fields, inserts to Railway with status "pending" (requires review),
 * then redirects to the submit page with a success or error param.
 */

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { deals } from "@/lib/schema";

const VALID_CATEGORIES = [
  "phones",
  "electronics",
  "vehicles",
  "property",
  "fashion",
  "home",
  "services",
  "other",
] as const;

type Category = (typeof VALID_CATEGORIES)[number];

export async function submitDeal(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const priceStr = formData.get("price")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const location = formData.get("location")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const sellerName = formData.get("sellerName")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const telegram = formData
    .get("telegram")
    ?.toString()
    .trim()
    .replace(/^@/, "");

  // Required field check
  if (!title || !priceStr || !category || !location || !description || !sellerName) {
    redirect("/submit?error=missing_fields");
  }

  // Price must be a positive integer ≥ 1,000 UGX
  const price = parseInt(priceStr!, 10);
  if (isNaN(price) || price < 1000) {
    redirect("/submit?error=invalid_price");
  }

  // Category must match DB enum
  if (!VALID_CATEGORIES.includes(category as Category)) {
    redirect("/submit?error=invalid_category");
  }

  // Derive a telegram handle — fall back to sanitised seller name
  const sellerTelegram =
    telegram && telegram.length > 0
      ? telegram
      : sellerName!.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 32);

  // Photo URLs — comma-separated list from the optional photo URL field
  const photoInput = formData.get("photoUrls")?.toString().trim() || null;
  const photos = photoInput
    ? photoInput
        .split(",")
        .map((u) => u.trim())
        .filter((u) => u.startsWith("http"))
        .join(",") || null
    : null;

  try {
    await db.insert(deals).values({
      id: `deal-${Date.now()}`,
      title: title!,
      description: description!,
      price,
      category: category as Category,
      sellerName: sellerName!,
      sellerTelegram,
      sellerPhone: phone,
      location: location!,
      status: "pending", // listing goes live after manual review
      featured: false,
      sellerVerified: false,
      photos,
    });
  } catch (err) {
    console.error("[submit-deal] DB insert failed:", err);
    redirect("/submit?error=server_error");
  }

  redirect("/submit?success=true");
}
