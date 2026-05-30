import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDealById, getAllActiveAgents } from "../../../../lib/queries";
import { formatPrice } from "../../../../lib/data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDealById(id);
  if (!deal) return { title: "Deal not found" };
  return {
    title: `Request Escrow — ${deal.title}`,
    description: `Use a verified escrow agent to safely buy: ${deal.title}`,
  };
}

export default async function RequestEscrowPage({ params }: PageProps) {
  const { id } = await params;
  const [deal, agents] = await Promise.all([
    getDealById(id),
    getAllActiveAgents(),
  ]);

  if (!deal) notFound();

  const verifiedAgents = agents.filter((a) => a.verified);

  // Pre-fill a Telegram bot message for the buyer
  const botMessage = encodeURIComponent(
    `Hi! I want to use an escrow agent for deal #${deal.id}: "${deal.title}" (UGX ${deal.price.toLocaleString("en-UG")}). Can you help me find an agent?`
  );
  const botUrl = `https://t.me/DealsinKampalaBot?text=${botMessage}`;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.25rem" }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--color-muted)" }}>
        <Link href="/" style={{ color: "var(--color-muted)", textDecoration: "none" }}>Home</Link>
        {" / "}
        <Link href="/deals" style={{ color: "var(--color-muted)", textDecoration: "none" }}>Deals</Link>
        {" / "}
        <Link href={`/deals/${deal.id}`} style={{ color: "var(--color-muted)", textDecoration: "none" }}>
          {deal.title.slice(0, 35)}…
        </Link>
        {" / "}
        <span style={{ color: "var(--color-text)" }}>Request Escrow</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#D1FAE5",
            color: "#065F46",
            padding: "0.3rem 0.875rem",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 700,
            marginBottom: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          🛡️ ESCROW PROTECTION
        </div>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "0.5rem",
          }}
        >
          Request an Escrow Agent
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "0.95rem", lineHeight: 1.65 }}>
          A verified agent holds your payment in trust until you confirm the item is as described.
          Your money is protected.
        </p>
      </div>

      {/* Deal summary card */}
      <div
        style={{
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: 12,
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "#065F46", fontWeight: 700, marginBottom: "0.25rem" }}>
            DEAL YOU&apos;RE BUYING
          </div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>{deal.title}</div>
          <div style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            📍 {deal.location} · {formatPrice(deal.price)}
          </div>
        </div>
        <Link
          href={`/deals/${deal.id}`}
          style={{
            color: "#065F46",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          View deal →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Left: How escrow works */}
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>
            How this works
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              {
                step: "1",
                title: "Choose an agent near you",
                desc: "Pick a verified agent from the list below who operates in your area.",
              },
              {
                step: "2",
                title: "Contact the agent on Telegram",
                desc: "DM them directly to coordinate the deal. They&apos;ll give you a mobile money number.",
              },
              {
                step: "3",
                title: "Send payment to agent",
                desc: "Agent holds funds in trust. The seller can see confirmation but can&apos;t touch the money yet.",
              },
              {
                step: "4",
                title: "Inspect and confirm",
                desc: "Once you&apos;re happy with the item, tell the agent. They release payment to the seller.",
              },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  display: "flex",
                  gap: "0.875rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: "var(--color-green-primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{s.title}</div>
                  <div style={{ color: "var(--color-muted)", fontSize: "0.825rem", lineHeight: 1.5, marginTop: "0.1rem" }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Telegram bot shortcut */}
          <div
            style={{
              marginTop: "1.5rem",
              backgroundColor: "var(--color-green-primary)",
              borderRadius: 10,
              padding: "1.1rem",
              color: "#fff",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
              📱 Quick option: message the bot
            </div>
            <div style={{ opacity: 0.85, fontSize: "0.825rem", marginBottom: "0.75rem" }}>
              @DealsinKampalaBot will match you with an available agent in your area instantly.
            </div>
            <a
              href={botUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                backgroundColor: "#fff",
                color: "var(--color-green-primary)",
                padding: "0.5rem 1rem",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              Message @DealsinKampalaBot →
            </a>
          </div>
        </div>

        {/* Right: Agent list */}
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>
            Verified agents ({verifiedAgents.length})
          </h2>

          {verifiedAgents.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "1.5rem",
                textAlign: "center",
                color: "var(--color-muted)",
                fontSize: "0.875rem",
              }}
            >
              No verified agents yet.{" "}
              <Link href="/agents" style={{ color: "var(--color-orange)" }}>
                Browse all agents →
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                maxHeight: 460,
                overflowY: "auto",
              }}
            >
              {verifiedAgents.map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid #BBF7D0",
                    borderRadius: 10,
                    padding: "1rem 1.1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                      {agent.name}{" "}
                      <span style={{ fontSize: "0.75rem", color: "#065F46", fontWeight: 600 }}>
                        ✓
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginTop: "0.15rem" }}>
                      📍 {agent.area} — {agent.landmark}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
                      @{agent.telegram}
                      {agent.mtn ? ` · MTN: ${agent.mtn}` : ""}
                      {agent.airtel ? ` · Airtel: ${agent.airtel}` : ""}
                    </div>
                  </div>
                  <a
                    href={`https://t.me/${agent.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "var(--color-green-primary)",
                      color: "#fff",
                      padding: "0.4rem 0.875rem",
                      borderRadius: 6,
                      textDecoration: "none",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    DM →
                  </a>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/agents"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "0.875rem",
              color: "var(--color-muted)",
              textDecoration: "none",
              fontSize: "0.85rem",
            }}
          >
            Browse all agents →
          </Link>
        </div>
      </div>

      {/* Back */}
      <div style={{ marginTop: "2rem" }}>
        <Link
          href={`/deals/${deal.id}`}
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          ← Back to deal
        </Link>
      </div>
    </div>
  );
}
