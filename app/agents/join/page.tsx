import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Join as Agent",
  description: "Become a verified escrow agent on DealsInKampala",
};

const DIVISIONS = ["Kampala Central", "Kampala North", "Kampala South", "Kampala East", "Kampala West"];
const AREAS = ["Nakawa", "Ntinda", "Makerere", "Kawempe", "Makindye", "Lubaga", "Mukono", "Wakiso"];

async function submitAgent(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const altPhone = formData.get("altPhone")?.toString().trim() || null;
  const area = formData.get("area")?.toString().trim();
  const division = formData.get("division")?.toString().trim();
  const landmark = formData.get("landmark")?.toString().trim();
  const telegramHandle = formData.get("telegramHandle")?.toString().trim();

  if (!name || !area || !division || !landmark || !telegramHandle) {
    redirect("/agents/join?error=missing_fields");
  }

  try {
    const res = await fetch("https://dealsinkampala.vercel.app/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, altPhone, area, division, landmark, telegramHandle }),
    });

    if (res.ok) {
      redirect("/agents/join?success=true");
    } else {
      redirect("/agents/join?error=failed");
    }
  } catch {
    redirect("/agents/join?error=network");
  }
}

interface PageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function AgentJoinPage({ searchParams }: PageProps) {
  const { success, error } = await searchParams;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Join as Escrow Agent</h1>
        <p style={{ color: "var(--color-muted)" }}>Earn 1% commission on every successful deal.</p>
      </div>

      {success && (
        <div style={{ backgroundColor: "#D1FAE5", border: "1px solid #10B981", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem", color: "#065F46" }}>
          Application submitted! We'll verify you within 24 hours.
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem", color: "#991B1B" }}>
          {error === "missing_fields" ? "Please fill all required fields" : "Something went wrong. Please try again."}
        </div>
      )}

      <form action={submitAgent} style={{ display: "grid", gap: "1.5rem" }}>
        <div>
          <label htmlFor="name" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Full Name *</label>
          <input id="name" name="name" type="text" required placeholder="Your full name" style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="phone" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Primary Phone</label>
            <input id="phone" name="phone" type="tel" placeholder="+256 700 123456" style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div>
            <label htmlFor="altPhone" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Alternate Phone</label>
            <input id="altPhone" name="altPhone" type="tel" placeholder="+256 700 654321" style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="area" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Area *</label>
            <select id="area" name="area" required style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box" }}>
              <option value="">Select area</option>
              {AREAS.map((a) => (<option key={a} value={a}>{a}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="division" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Division *</label>
            <select id="division" name="division" required style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box" }}>
              <option value="">Select division</option>
              {DIVISIONS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="landmark" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Landmark *</label>
          <input id="landmark" name="landmark" type="text" required placeholder="Near Nakawa Market" style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <div>
          <label htmlFor="telegramHandle" style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Telegram Handle *</label>
          <input id="telegramHandle" name="telegramHandle" type="text" required placeholder="@yourhandle" style={{ width: "100%", padding: "0.75rem", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: "1rem", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <button type="submit" style={{ padding: "0.75rem", backgroundColor: "#10B981", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", marginTop: "1rem", fontSize: "1rem" }}>
          Submit Application
        </button>

        <p style={{ fontSize: "0.85rem", color: "var(--color-muted)", textAlign: "center" }}>Verified within 24 hours</p>
      </form>
    </div>
  );
}
