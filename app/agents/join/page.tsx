import type { Metadata } from "next";
import Link from "next/link";
import { joinAsAgent } from "../../actions/join-agent";

export const metadata: Metadata = {
  title: "Become an Escrow Agent — DealsInKampala",
  description:
    "Apply to become a verified escrow agent in Kampala. Hold mobile money in trust for P2P deals and earn 1% commission on every completed deal.",
};

const DIVISIONS = [
  "Kampala Central",
  "Kampala North",
  "Kampala South",
  "Kampala East",
  "Kampala West",
];

const AREAS = [
  "Nakawa",
  "Ntinda",
  "Makerere",
  "Kawempe",
  "Makindye",
  "Lubaga",
  "Mukono",
  "Wakiso",
  "Kololo",
  "Entebbe",
];

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields:
    "Please fill in all required fields (name, Telegram, area, division, landmark).",
  no_mobile_money:
    "At least one mobile money number (MTN or Airtel) is required.",
  server_error: "Something went wrong. Please try again.",
};

interface PageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function AgentJoinPage({ searchParams }: PageProps) {
  const { success, error } = await searchParams;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    fontSize: "0.9rem",
    backgroundColor: "#fff",
    color: "var(--color-text)",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.825rem",
    fontWeight: 600,
    color: "var(--color-text)",
    marginBottom: "0.375rem",
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.25rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
          🛡️ JOIN THE NETWORK
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "0.625rem",
          }}
        >
          Become an Escrow Agent
        </h1>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: "0.95rem",
            lineHeight: 1.65,
            maxWidth: 500,
            margin: "0 auto",
          }}
        >
          Earn 1% commission on every completed deal in your area. No upfront
          cost — just a mobile money account and your reputation.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { icon: "💰", label: "Commission", value: "1% per deal" },
          { icon: "🆓", label: "Cost to join", value: "Free" },
          { icon: "⏱️", label: "Review time", value: "24–72 hours" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.375rem" }}>
              {s.icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{s.value}</div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-muted)",
                marginTop: "0.2rem",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Success banner */}
      {success === "true" && (
        <div
          style={{
            backgroundColor: "#D1FAE5",
            border: "1px solid #6EE7B7",
            borderRadius: 12,
            padding: "1.25rem 1.5rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.875rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>✅</span>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "#065F46",
                marginBottom: "0.25rem",
              }}
            >
              Application submitted!
            </div>
            <div style={{ fontSize: "0.875rem", color: "#047857" }}>
              We&apos;ll verify your details and contact you on Telegram within
              24–72 hours. Watch for a message from{" "}
              <strong>@DealsinKampalaBot</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && ERROR_MESSAGES[error] && (
        <div
          style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: 12,
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            color: "#991B1B",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          ⚠️ {ERROR_MESSAGES[error]}
        </div>
      )}

      {/* Application form */}
      <form
        action={joinAsAgent}
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          padding: "2rem",
        }}
      >
        <h2
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1.5rem" }}
        >
          Your details
        </h2>

        {/* Full name */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Full name *</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Brian Kato"
            style={inputStyle}
          />
        </div>

        {/* Telegram handle */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Telegram handle *</label>
          <p
            style={{
              fontSize: "0.775rem",
              color: "var(--color-muted)",
              marginBottom: "0.375rem",
            }}
          >
            We&apos;ll contact you here to verify your application.
          </p>
          <input
            type="text"
            name="telegramHandle"
            required
            placeholder="@yourhandle"
            style={inputStyle}
          />
        </div>

        {/* Area + Division */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <label style={labelStyle}>Area *</label>
            <select name="area" required style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Select area</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Division *</label>
            <select name="division" required style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Select division</option>
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Landmark */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Landmark / meeting point *</label>
          <p
            style={{
              fontSize: "0.775rem",
              color: "var(--color-muted)",
              marginBottom: "0.375rem",
            }}
          >
            Where buyers and sellers can find you easily.
          </p>
          <input
            type="text"
            name="landmark"
            required
            placeholder="e.g. Near Nakawa Market, opposite Total petrol station"
            style={inputStyle}
          />
        </div>

        {/* Mobile money (at least one required) */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label
            style={{ ...labelStyle, marginBottom: "0.25rem", fontSize: "0.9rem" }}
          >
            Mobile money numbers
          </label>
          <p
            style={{
              fontSize: "0.775rem",
              color: "var(--color-muted)",
              marginBottom: "0.75rem",
            }}
          >
            At least one is required — this is how you&apos;ll hold escrow.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label style={labelStyle}>MTN MoMo number</label>
              <input
                type="tel"
                name="mtnNumber"
                placeholder="e.g. 0772123456"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Airtel Money number</label>
              <input
                type="tel"
                name="airtelNumber"
                placeholder="e.g. 0752123456"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Optional phone numbers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <label style={labelStyle}>Primary phone (optional)</label>
            <input
              type="tel"
              name="phone"
              placeholder="+256 700 123456"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Alternate phone (optional)</label>
            <input
              type="tel"
              name="altPhone"
              placeholder="+256 700 654321"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Terms note */}
        <p
          style={{
            fontSize: "0.775rem",
            color: "var(--color-muted)",
            lineHeight: 1.6,
            marginBottom: "1.25rem",
            padding: "0.875rem",
            backgroundColor: "#FFFBEB",
            borderRadius: 8,
            border: "1px solid #FDE68A",
          }}
        >
          By applying you confirm you are a resident of Kampala or Greater Kampala
          and have a valid mobile money account. Applications are reviewed manually
          before approval.
        </p>

        {/* Submit */}
        <button
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "var(--color-green-primary)",
            color: "#fff",
            border: "none",
            padding: "0.875rem 1.5rem",
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "-0.01em",
          }}
        >
          Submit application →
        </button>
      </form>

      {/* Back link */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link
          href="/agents"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            fontSize: "0.875rem",
          }}
        >
          ← Browse verified agents
        </Link>
      </div>
    </div>
  );
}
