import type { Metadata } from "next";
import Link from "next/link";
import { submitDeal } from "../actions/submit-deal";

export const metadata: Metadata = {
  title: "Submit a Deal",
  description:
    "List your item on DealsInKampala. Free to submit. Sell phones, electronics, vehicles, property and more.",
};

const CATEGORIES = [
  { value: "phones",      label: "📱 Phones" },
  { value: "electronics", label: "💻 Electronics" },
  { value: "vehicles",    label: "🚗 Vehicles" },
  { value: "property",    label: "🏠 Property" },
  { value: "fashion",     label: "👗 Fashion" },
  { value: "home",        label: "🛋️ Home & Furniture" },
  { value: "services",    label: "🔧 Services" },
  { value: "other",       label: "📦 Other" },
] as const;

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields:   "Please fill in all required fields.",
  invalid_price:    "Price must be a number of at least UGX 1,000.",
  invalid_category: "Please select a valid category.",
  server_error:     "Something went wrong on our end. Please try again.",
};

interface PageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function SubmitPage({ searchParams }: PageProps) {
  const { success, error } = await searchParams;

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
          ✨ FREE TO LIST
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "0.625rem",
          }}
        >
          Submit your deal
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "0.95rem", lineHeight: 1.65 }}>
          Listing is free. Deals go live within 2 hours after review.
          You only pay a small escrow commission when the deal completes.
        </p>
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
            <div style={{ fontWeight: 700, color: "#065F46", marginBottom: "0.25rem" }}>
              Deal submitted successfully!
            </div>
            <div style={{ fontSize: "0.875rem", color: "#047857" }}>
              Your listing is under review and will go live within 2 hours.
              We&apos;ll contact you on Telegram once it&apos;s approved.
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

      {/* Quick option: Telegram */}
      <div
        style={{
          backgroundColor: "var(--color-green-primary)",
          borderRadius: 12,
          padding: "1.25rem 1.5rem",
          color: "#fff",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.6, marginBottom: "0.3rem" }}>
            FASTEST WAY
          </div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>📱 Submit via Telegram Bot</div>
          <div style={{ opacity: 0.85, fontSize: "0.825rem", marginTop: "0.2rem" }}>
            Type <strong>/submit</strong> in <strong>@DealsinKampalaBot</strong> — takes 60 seconds.
          </div>
        </div>
        <a
          href="https://t.me/DealsinKampalaBot?start=submit"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "var(--color-orange)",
            color: "#fff",
            padding: "0.625rem 1.25rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.825rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Open Bot →
        </a>
      </div>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
          color: "var(--color-muted)",
          fontSize: "0.8rem",
        }}
      >
        <div style={{ flex: 1, height: 1, backgroundColor: "var(--color-border)" }} />
        <span>or fill in the form below</span>
        <div style={{ flex: 1, height: 1, backgroundColor: "var(--color-border)" }} />
      </div>

      {/* Web form */}
      <form
        action={submitDeal}
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          padding: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          Listing details
        </h2>

        {/* Title */}
        <FormField label="Item title *" hint="Be specific — brand, model, size, key specs">
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Samsung Galaxy S23 256GB — Like New"
            style={inputStyle}
          />
        </FormField>

        {/* Price + Category row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <label style={labelStyle}>Price (UGX) *</label>
            <input
              type="number"
              name="price"
              required
              min={1000}
              placeholder="e.g. 2500000"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Category *</label>
            <select name="category" required style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <FormField label="Location *" hint="Area or landmark in Kampala (e.g. Ntinda, Kawempe, Kololo)">
          <input
            type="text"
            name="location"
            required
            placeholder="e.g. Ntinda, Kampala"
            style={inputStyle}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description *" hint="Condition, reason for selling, what's included, any faults">
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Describe your item honestly. Include condition, age, and what's included."
            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
          />
        </FormField>

        {/* Seller name */}
        <FormField label="Your name *" hint="This will be shown on the listing">
          <input
            type="text"
            name="sellerName"
            required
            placeholder="e.g. Brian K."
            style={inputStyle}
          />
        </FormField>

        {/* Phone + Telegram row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <label style={labelStyle}>Phone number</label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. 0772123456"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Telegram handle</label>
            <input
              type="text"
              name="telegram"
              placeholder="e.g. @yourhandle"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Photo URLs — Phase 8 */}
        <FormField
          label="Photo URL(s)"
          hint="Paste a direct image link (e.g. from Google Drive, Dropbox, Imgur). Separate multiple URLs with commas."
        >
          <input
            type="url"
            name="photoUrls"
            placeholder="https://i.imgur.com/example.jpg"
            style={inputStyle}
          />
        </FormField>

        {/* Policy note */}
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
          By submitting you agree that this listing follows our community guidelines.
          No stolen goods, counterfeit items, or anything illegal under Ugandan law.
          Listings are reviewed before going live.
        </p>

        {/* Submit button */}
        <button
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "var(--color-orange)",
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
          Submit listing for review →
        </button>
      </form>

      {/* Commission info */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1.25rem",
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          fontSize: "0.825rem",
          color: "var(--color-muted)",
          lineHeight: 1.65,
        }}
      >
        <strong style={{ color: "var(--color-text)" }}>💰 Cost breakdown:</strong>{" "}
        Listing is always free. If you sell via an escrow agent, a 2% commission applies
        (1% to the agent, 1% to Africa Team). High-value deals (cars, land, houses) pay 6%
        total. You only pay when the deal completes.
      </div>

      {/* Back link */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link
          href="/deals"
          style={{ color: "var(--color-muted)", textDecoration: "none", fontSize: "0.875rem" }}
        >
          ← Browse deals instead
        </Link>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: "0.9rem",
  outline: "none",
  backgroundColor: "#fff",
  color: "var(--color-text)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.825rem",
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: "0.375rem",
};

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={labelStyle}>{label}</label>
      {hint && (
        <p style={{ fontSize: "0.775rem", color: "var(--color-muted)", marginBottom: "0.375rem" }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
