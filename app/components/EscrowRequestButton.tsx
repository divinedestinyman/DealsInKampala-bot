"use client";

import { useState } from "react";
import type { Deal } from "@/lib/schema";

interface EscrowRequestButtonProps {
  deal: Deal;
}

export default function EscrowRequestButton({ deal }: EscrowRequestButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const buyerName = formData.get("buyerName")?.toString() || "";
    const buyerPhone = formData.get("buyerPhone")?.toString() || "";
    const buyerTelegram = formData.get("buyerTelegram")?.toString() || "";

    try {
      const response = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: deal.id,
          dealTitle: deal.title,
          buyerName,
          buyerPhone,
          buyerTelegram,
          sellerName: deal.sellerName,
          sellerTelegram: deal.sellerTelegram,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setShowForm(false);
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ backgroundColor: "#D1FAE5", border: "1px solid #10B981", borderRadius: 8, padding: "1rem", color: "#065F46" }}>
        Escrow request sent! Agent will contact you soon.
      </div>
    );
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubmit} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Request Escrow</h3>
        <div style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label htmlFor="buyerName">Your Name</label>
            <input id="buyerName" name="buyerName" type="text" required placeholder="Your name" style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--color-border)", borderRadius: 4 }} />
          </div>
          <div>
            <label htmlFor="buyerPhone">Phone</label>
            <input id="buyerPhone" name="buyerPhone" type="tel" required placeholder="+256 700 123456" style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--color-border)", borderRadius: 4 }} />
          </div>
          <div>
            <label htmlFor="buyerTelegram">Telegram (optional)</label>
            <input id="buyerTelegram" name="buyerTelegram" type="text" placeholder="@yourhandle" style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--color-border)", borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: "0.75rem", backgroundColor: "#10B981", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
            {loading ? "Sending..." : "Send Request"}
          </button>
          <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "0.75rem", backgroundColor: "transparent", border: "1px solid var(--color-border)", borderRadius: 4, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      style={{
        width: "100%",
        padding: "0.75rem",
        backgroundColor: "#10B981",
        color: "white",
        border: "none",
        borderRadius: 8,
        fontSize: "1rem",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Request Escrow
    </button>
  );
}
