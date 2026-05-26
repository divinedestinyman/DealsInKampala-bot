import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "../../lib/data";

export const metadata: Metadata = {
  title: "Submit a Deal",
  description:
    "List your item on DealsInKampala. Free to submit. Sell phones, electronics, vehicles, property and more.",
};

export default function SubmitPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.25rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#D1FAE5",
            color: "#065F46",
            padding: "0.3rem 0.875rem",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 700,
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          ✨ FREE TO LIST
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}
        >
          Submit your deal
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "1rem", lineHeight: 1.65 }}>
          List anything for free. Deals go live within minutes after review.
          No listing fee. You only pay a small escrow commission when the deal completes.
        </p>
      </div>

      {/* Primary CTA — Telegram */}
      <div
        style={{
          backgroundColor: "var(--color-green-primary)",
          borderRadius: 16,
          padding: "2rem",
          color: "#fff",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.65,
              marginBottom: "0.5rem",
            }}
          >
            RECOMMENDED
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            📱 Submit via Telegram Bot
          </h2>
          <p style={{ opacity: 0.85, fontSize: "0.875rem", lineHeight: 1.65 }}>
            The fastest way. Type <strong>/submit</strong> in{" "}
            <strong>@DealsinKampalaBot</strong> and follow the prompts. Your
            listing goes live in minutes.
          </p>
        </div>
        <a
          href="https://t.me/DealsinKampalaBot?start=submit"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "var(--color-orange)",
            color: "#fff",
            padding: "0.875rem 1.5rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Open Bot →
        </a>
      </div>

      {/* What to include */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "1.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem" }}>
          What to include in your listing
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.875rem",
          }}
        >
          {[
            { icon: "📝", label: "Clear title", desc: "Brand, model, size, key specs" },
            { icon: "💰", label: "Your price (UGX)", desc: "Firm or negotiable — be honest" },
            { icon: "📍", label: "Your location", desc: "Area or landmark in Kampala" },
            { icon: "📸", label: "Real photos", desc: "At least 2–3 photos of the actual item" },
            { icon: "📋", label: "Honest description", desc: "Condition, reason for selling, any faults" },
            { icon: "📞", label: "Contact details", desc: "Telegram handle or phone number" },
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}
            >
              <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.label}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "1.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          What can I sell?
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.5rem",
          }}
        >
          {CATEGORIES.map((cat) => (
            <div
              key={cat.value}
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "0.625rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.8rem",
            color: "var(--color-muted)",
          }}
        >
          No stolen goods, counterfeit items, or anything illegal under Ugandan law.
          Listings are reviewed before going live.
        </p>
      </div>

      {/* Commission info */}
      <div
        style={{
          backgroundColor: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          💰 Cost to sell
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>
              Listing fee
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--color-green-primary)",
              }}
            >
              FREE
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>
              Always free to list
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>
              Escrow commission (only if sold via agent)
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-muted)", lineHeight: 1.6 }}>
              Standard deals: 2% total<br />
              Cars / Land / Houses: 6% total<br />
              <em>Agent 1% + Africa Team 1–5%</em>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTAs */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <a
          href="https://t.me/DealsinKampalaBot?start=submit"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "var(--color-orange)",
            color: "#fff",
            padding: "0.875rem 1.75rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          📱 Submit via Telegram
        </a>
        <Link
          href="/deals"
          style={{
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            padding: "0.875rem 1.75rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: "1px solid var(--color-border)",
          }}
        >
          Browse deals instead
        </Link>
      </div>
    </div>
  );
}
