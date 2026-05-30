import type { Metadata } from "next";
import Link from "next/link";
import { getPendingDeals, getPendingAgents } from "../../lib/queries";
import {
  approveDeal,
  rejectDeal,
  featureDeal,
  verifyAgent,
  rejectAgent,
} from "../actions/admin-deal";
import { formatPrice } from "../../lib/data";

export const metadata: Metadata = { title: "Admin — DealsInKampala" };
export const dynamic = "force-dynamic";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "admin";

interface PageProps {
  searchParams: Promise<{
    key?: string;
    approved?: string;
    rejected?: string;
    featured?: string;
    verified?: string;
    rejected_agent?: string;
    error?: string;
  }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { key } = params;

  // ── Auth gate ────────────────────────────────────────────────────────────────
  if (!key || key !== ADMIN_KEY) {
    return (
      <div
        style={{
          maxWidth: 420,
          margin: "8rem auto",
          padding: "0 1.25rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Admin Access Required
        </h1>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
          }}
        >
          Append <code>?key=YOUR_ADMIN_KEY</code> to this URL.
          <br />
          Set <code>ADMIN_KEY</code> in your Vercel environment variables.
        </p>
        {params.error === "unauthorized" && (
          <p
            style={{
              marginTop: "1rem",
              color: "#991B1B",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            ⚠️ Invalid admin key.
          </p>
        )}
      </div>
    );
  }

  const [pendingDeals, pendingAgents] = await Promise.all([
    getPendingDeals(),
    getPendingAgents(),
  ]);

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
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
            DealsInKampala — moderation queue
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link
            href={`/admin/commissions?key=${key}`}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            💰 Commissions
          </Link>
          <Link
            href="/"
            style={{
              color: "var(--color-muted)",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            ← Back to site
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          icon="🕐"
          value={pendingDeals.length}
          label="Deals awaiting review"
          color="#F59E0B"
        />
        <StatCard
          icon="👤"
          value={pendingAgents.length}
          label="Agent applications"
          color="#3B82F6"
        />
      </div>

      {/* Flash messages */}
      {params.approved && (
        <Toast bg="#D1FAE5" text={`✅ Deal ${params.approved} approved — now live.`} />
      )}
      {params.rejected && (
        <Toast bg="#FEF2F2" text={`🚫 Deal ${params.rejected} rejected.`} />
      )}
      {params.featured && (
        <Toast bg="#FEF3C7" text={`⭐ Featured status updated for ${params.featured}.`} />
      )}
      {params.verified && (
        <Toast bg="#D1FAE5" text={`✅ Agent ${params.verified} verified and live.`} />
      )}
      {params.rejected_agent && (
        <Toast bg="#FEF2F2" text={`🚫 Agent application ${params.rejected_agent} rejected.`} />
      )}

      {/* ── Pending Deals ──────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          🕐 Pending Deals
          <span
            style={{
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              fontSize: "0.75rem",
              fontWeight: 800,
              padding: "0.15rem 0.6rem",
              borderRadius: 20,
            }}
          >
            {pendingDeals.length}
          </span>
        </h2>

        {pendingDeals.length === 0 ? (
          <EmptyState text="No deals awaiting review. All clear! 🎉" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {pendingDeals.map((deal) => (
              <div
                key={deal.id}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  padding: "1.25rem 1.5rem",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1.25rem",
                  alignItems: "start",
                }}
              >
                {/* Deal info */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      marginBottom: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <Badge color="#3B82F6">{deal.category}</Badge>
                    <Badge color="#6B7280">{deal.id}</Badge>
                  </div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: "0.375rem",
                    }}
                  >
                    {deal.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--color-muted)",
                      marginBottom: "0.5rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {deal.description.slice(0, 220)}
                    {deal.description.length > 220 ? "…" : ""}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "0.8rem",
                      color: "var(--color-muted)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>💰 {formatPrice(deal.price)}</span>
                    <span>📍 {deal.location}</span>
                    <span>
                      👤 {deal.sellerName} @{deal.sellerTelegram}
                    </span>
                    {deal.sellerPhone && <span>📞 {deal.sellerPhone}</span>}
                  </div>
                </div>

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    minWidth: 130,
                  }}
                >
                  <form action={approveDeal}>
                    <input type="hidden" name="adminKey" value={key} />
                    <input type="hidden" name="dealId" value={deal.id} />
                    <button type="submit" style={actionBtn("#065F46", "#D1FAE5")}>
                      ✓ Approve
                    </button>
                  </form>

                  <form action={rejectDeal}>
                    <input type="hidden" name="adminKey" value={key} />
                    <input type="hidden" name="dealId" value={deal.id} />
                    <button type="submit" style={actionBtn("#991B1B", "#FEF2F2")}>
                      ✗ Reject
                    </button>
                  </form>

                  <form action={featureDeal}>
                    <input type="hidden" name="adminKey" value={key} />
                    <input type="hidden" name="dealId" value={deal.id} />
                    <input type="hidden" name="featured" value="true" />
                    <button type="submit" style={actionBtn("#92400E", "#FEF3C7")}>
                      ⭐ Feature
                    </button>
                  </form>

                  <Link
                    href={`/deals/${deal.id}`}
                    target="_blank"
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      color: "var(--color-muted)",
                      textDecoration: "none",
                      padding: "0.3rem",
                    }}
                  >
                    Preview →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Pending Agents ─────────────────────────────────────────────────────── */}
      <section>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          👤 Agent Applications
          <span
            style={{
              backgroundColor: "#DBEAFE",
              color: "#1D4ED8",
              fontSize: "0.75rem",
              fontWeight: 800,
              padding: "0.15rem 0.6rem",
              borderRadius: 20,
            }}
          >
            {pendingAgents.length}
          </span>
        </h2>

        {pendingAgents.length === 0 ? (
          <EmptyState text="No pending agent applications." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {pendingAgents.map((agent) => (
              <div
                key={agent.id}
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  padding: "1.25rem 1.5rem",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1.25rem",
                  alignItems: "start",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: "0.4rem",
                    }}
                  >
                    {agent.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "0.85rem",
                      color: "var(--color-muted)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>💬 @{agent.telegramHandle}</span>
                    <span>
                      📍 {agent.area}, {agent.division}
                    </span>
                    <span>🏷 {agent.landmark}</span>
                    {agent.mtnNumber && <span>MTN: {agent.mtnNumber}</span>}
                    {agent.airtelNumber && (
                      <span>Airtel: {agent.airtelNumber}</span>
                    )}
                    {agent.phone && <span>📞 {agent.phone}</span>}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    minWidth: 110,
                  }}
                >
                  <form action={verifyAgent}>
                    <input type="hidden" name="adminKey" value={key} />
                    <input type="hidden" name="agentId" value={agent.id} />
                    <button type="submit" style={actionBtn("#065F46", "#D1FAE5")}>
                      ✓ Verify
                    </button>
                  </form>
                  <form action={rejectAgent}>
                    <input type="hidden" name="adminKey" value={key} />
                    <input type="hidden" name="agentId" value={agent.id} />
                    <button type="submit" style={actionBtn("#991B1B", "#FEF2F2")}>
                      ✗ Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: "2rem" }}>{icon}</div>
      <div>
        <div
          style={{ fontSize: "2rem", fontWeight: 800, color, lineHeight: 1 }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--color-muted)",
            marginTop: "0.2rem",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span
      style={{
        backgroundColor: `${color}18`,
        color,
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "0.15rem 0.5rem",
        borderRadius: 4,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

function Toast({ bg, text }: { bg: string; text: string }) {
  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: 8,
        padding: "0.75rem 1rem",
        fontSize: "0.875rem",
        fontWeight: 600,
        marginBottom: "1rem",
      }}
    >
      {text}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        padding: "2rem",
        textAlign: "center",
        color: "var(--color-muted)",
        fontSize: "0.9rem",
      }}
    >
      {text}
    </div>
  );
}

function actionBtn(color: string, bg: string): React.CSSProperties {
  return {
    width: "100%",
    backgroundColor: bg,
    color,
    border: `1px solid ${color}40`,
    padding: "0.5rem 0.75rem",
    borderRadius: 6,
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "block",
  };
}
