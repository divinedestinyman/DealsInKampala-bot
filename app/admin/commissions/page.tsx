import type { Metadata } from "next";
import Link from "next/link";
import { getAllCommissions } from "../../../lib/queries";
import { markCommissionPaid } from "../../actions/mark-paid";

export const metadata: Metadata = { title: "Commission Tracker — DealsInKampala Admin" };
export const dynamic = "force-dynamic";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "admin";

interface PageProps {
  searchParams: Promise<{
    key?: string;
    paid?: string;
    filter?: "all" | "unpaid" | "paid";
    error?: string;
  }>;
}

export default async function CommissionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { key, filter = "all" } = params;

  // ── Auth gate ────────────────────────────────────────────────────────────────
  if (!key || key !== ADMIN_KEY) {
    return (
      <div style={{ maxWidth: 420, margin: "8rem auto", padding: "0 1.25rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Admin Access Required
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
          Append <code>?key=YOUR_ADMIN_KEY</code> to this URL.
        </p>
      </div>
    );
  }

  const all = await getAllCommissions();

  // Filter
  const records =
    filter === "unpaid"
      ? all.filter((r) => !r.paid)
      : filter === "paid"
      ? all.filter((r) => r.paid)
      : all;

  // Summary totals
  const totalAmount = all.reduce((s, r) => s + r.amountUgx, 0);
  const totalAgentComm = all.reduce((s, r) => s + r.agentCommissionUgx, 0);
  const totalAfricaTeam = all.reduce((s, r) => s + r.africaTeamCommissionUgx, 0);
  const unpaidAfricaTeam = all
    .filter((r) => !r.paid)
    .reduce((s, r) => s + r.africaTeamCommissionUgx, 0);

  const fmt = (n: number) =>
    `UGX ${n.toLocaleString("en-UG")}`;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Commission Tracker
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
            All escrow commission records — mark payouts as paid
          </p>
        </div>
        <Link
          href={`/admin?key=${key}`}
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          ← Admin dashboard
        </Link>
      </div>

      {/* Totals */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.875rem",
          marginBottom: "2rem",
        }}
      >
        <TotalCard label="Total deal volume" value={fmt(totalAmount)} color="#3B82F6" />
        <TotalCard label="Agent commissions" value={fmt(totalAgentComm)} color="#065F46" />
        <TotalCard label="Africa Team earned" value={fmt(totalAfricaTeam)} color="#7C3AED" />
        <TotalCard label="Africa Team pending" value={fmt(unpaidAfricaTeam)} color="#D97706" />
      </div>

      {/* Flash */}
      {params.paid && (
        <div
          style={{
            backgroundColor: "#D1FAE5",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          ✅ Commission {params.paid} marked as paid.
        </div>
      )}

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {(["all", "unpaid", "paid"] as const).map((f) => (
          <Link
            key={f}
            href={`/admin/commissions?key=${key}&filter=${f}`}
            style={{
              padding: "0.4rem 0.875rem",
              borderRadius: 20,
              fontSize: "0.8rem",
              fontWeight: 700,
              textDecoration: "none",
              backgroundColor: filter === f ? "var(--color-green-primary)" : "var(--color-surface)",
              color: filter === f ? "#fff" : "var(--color-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            {f === "all" ? `All (${all.length})` : f === "unpaid" ? `Unpaid (${all.filter((r) => !r.paid).length})` : `Paid (${all.filter((r) => r.paid).length})`}
          </Link>
        ))}
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: "3rem",
            textAlign: "center",
            color: "var(--color-muted)",
          }}
        >
          No commission records found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {records.map((rec) => (
            <div
              key={rec.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: `1px solid ${rec.paid ? "#BBF7D0" : "var(--color-border)"}`,
                borderRadius: 10,
                padding: "1.1rem 1.4rem",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <div>
                {/* Deal info row */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.35rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: rec.paid ? "#D1FAE5" : "#FEF3C7",
                      color: rec.paid ? "#065F46" : "#92400E",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.1rem 0.5rem",
                      borderRadius: 4,
                    }}
                  >
                    {rec.paid ? "✓ PAID" : "⏳ UNPAID"}
                  </span>
                  <span
                    style={{
                      backgroundColor: rec.dealType === "high_value" ? "#EDE9FE" : "#F3F4F6",
                      color: rec.dealType === "high_value" ? "#7C3AED" : "#6B7280",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.1rem 0.5rem",
                      borderRadius: 4,
                    }}
                  >
                    {rec.dealType === "high_value" ? "HIGH VALUE" : "STANDARD"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                    #{rec.id.slice(0, 8)}
                  </span>
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {rec.dealDescription}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.8rem",
                    color: "var(--color-muted)",
                    flexWrap: "wrap",
                  }}
                >
                  <span>👤 Buyer: {rec.buyerName}</span>
                  <span>🛍 Seller: {rec.sellerName}</span>
                  <span>🤝 Agent: {rec.agentName}</span>
                  <span>💰 Deal: {fmt(rec.amountUgx)}</span>
                </div>

                {/* Commission breakdown */}
                <div
                  style={{
                    display: "flex",
                    gap: "1.25rem",
                    fontSize: "0.8rem",
                    marginTop: "0.4rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#065F46" }}>
                    Agent cut: {fmt(rec.agentCommissionUgx)}
                  </span>
                  <span style={{ color: "#7C3AED" }}>
                    Africa Team: {fmt(rec.africaTeamCommissionUgx)}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--color-text)" }}>
                    Total comm: {fmt(rec.totalCommissionUgx)}
                  </span>
                  <span style={{ color: "var(--color-muted)" }}>
                    {rec.recordedAt
                      ? new Date(rec.recordedAt).toLocaleDateString("en-UG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>

                {rec.paid && rec.paidAt && (
                  <div style={{ fontSize: "0.75rem", color: "#065F46", marginTop: "0.25rem" }}>
                    Paid on{" "}
                    {new Date(rec.paidAt).toLocaleDateString("en-UG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
              </div>

              {/* Mark as paid button */}
              {!rec.paid && (
                <form action={markCommissionPaid}>
                  <input type="hidden" name="adminKey" value={key} />
                  <input type="hidden" name="commissionId" value={rec.id} />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#D1FAE5",
                      color: "#065F46",
                      border: "1px solid #6EE7B780",
                      padding: "0.5rem 1rem",
                      borderRadius: 6,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Mark paid ✓
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TotalCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "1rem 1.1rem",
      }}
    >
      <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginBottom: "0.25rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.05rem", fontWeight: 800, color, lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}
