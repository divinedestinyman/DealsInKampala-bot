"use client";

import { useEffect, useState } from "react";
import type { CommissionRecord } from "@/lib/schema";

interface UserData {
  telegramId: string;
  name: string;
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");

  useEffect(() => {
    const stored = localStorage.getItem("userTelegramId");
    if (stored) {
      setUser({ telegramId: stored, name: "Agent" });
      fetchCommissions(stored);
    } else {
      setLoading(false);
      setError("Please login to view commissions");
    }
  }, []);

  async function fetchCommissions(telegramId: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/commission?agentId=${telegramId}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      if (data.success) {
        setCommissions(data.data || []);
      } else {
        setError(data.error || "Failed to fetch");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = statusFilter === "all" ? commissions : statusFilter === "pending" ? commissions.filter(c => !c.paid) : commissions.filter(c => c.paid);
  const totalEarned = commissions.filter(c => c.paid).reduce((sum, c) => sum + c.agentCommissionUgx, 0);
  const pendingEarnings = commissions.filter(c => !c.paid).reduce((sum, c) => sum + c.agentCommissionUgx, 0);

  if (!user) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Login required to view commissions</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <h1>My Commissions</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "1.5rem" }}>
          <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Total Earned</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>UGX {totalEarned.toLocaleString()}</p>
        </div>
        <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "1.5rem" }}>
          <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>Pending</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>UGX {pendingEarnings.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ marginRight: "1rem" }}>
          <input type="radio" name="status" value="all" checked={statusFilter === "all"} onChange={() => setStatusFilter("all")} />
          All
        </label>
        <label style={{ marginRight: "1rem" }}>
          <input type="radio" name="status" value="pending" checked={statusFilter === "pending"} onChange={() => setStatusFilter("pending")} />
          Pending
        </label>
        <label>
          <input type="radio" name="status" value="paid" checked={statusFilter === "paid"} onChange={() => setStatusFilter("paid")} />
          Paid
        </label>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>No commissions yet</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {filtered.map((c) => (
            <div key={c.id} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{c.dealDescription}</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-muted)" }}>Deal: {c.dealId}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>UGX {c.agentCommissionUgx.toLocaleString()}</p>
                  <p style={{ fontSize: "0.85rem", color: c.paid ? "#10B981" : "#F59E0B" }}>{c.paid ? "Paid" : "Pending"}</p>
                </div>
              </div>
              <div style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "var(--color-muted)" }}>
                <p>{c.buyerName} → {c.sellerName}</p>
                <p>Amount: UGX {c.amountUgx.toLocaleString()} ({c.dealType})</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
