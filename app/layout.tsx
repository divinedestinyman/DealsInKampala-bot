import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DealsInKampala — Buy & Sell with Trust",
    template: "%s | DealsInKampala",
  },
  description:
    "Kampala's trusted P2P marketplace. Every deal backed by a verified escrow agent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteNav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.25rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: "var(--color-green-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Deals<span style={{ color: "var(--color-orange)" }}>in</span>Kampala
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <NavLink href="/deals">Browse Deals</NavLink>
          <NavLink href="/agents">Find Agent</NavLink>
          <NavLink href="/submit">Sell</NavLink>
          <a
            href="https://t.me/DealsinKampalaBot"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "var(--color-orange)",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            📱 Open Bot
          </a>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "var(--color-text)",
        fontSize: "0.9rem",
        fontWeight: 500,
      }}
    >
      {children}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-green-primary)",
        color: "#fff",
        padding: "3rem 1.25rem 2rem",
        marginTop: "5rem",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "2.5rem",
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            Deals<span style={{ color: "var(--color-orange)" }}>in</span>Kampala
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.7,
              opacity: 0.75,
              maxWidth: 360,
            }}
          >
            Kampala&apos;s trusted peer-to-peer marketplace. Every deal backed
            by a verified escrow agent who holds payment until both parties are
            satisfied.
          </p>
          <a
            href="https://t.me/DealsinKampalaBot"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "1.25rem",
              backgroundColor: "var(--color-orange)",
              color: "#fff",
              padding: "0.625rem 1.25rem",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            📱 Open Telegram Bot
          </a>
        </div>

        {/* Marketplace */}
        <div>
          <h4
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.5,
              marginBottom: "1rem",
              fontWeight: 600,
            }}
          >
            Marketplace
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <li><FooterLink href="/deals">Browse All Deals</FooterLink></li>
            <li><FooterLink href="/deals?category=phones">Phones</FooterLink></li>
            <li><FooterLink href="/deals?category=vehicles">Vehicles</FooterLink></li>
            <li><FooterLink href="/deals?category=property">Property</FooterLink></li>
            <li><FooterLink href="/submit">Submit a Deal</FooterLink></li>
          </ul>
        </div>

        {/* Community */}
        <div>
          <h4
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.5,
              marginBottom: "1rem",
              fontWeight: 600,
            }}
          >
            Community
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            <li>
              <a
                href="https://t.me/DealsinKampalaBot"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                Telegram Bot
              </a>
            </li>
            <li><FooterLink href="/agents">Find an Agent</FooterLink></li>
            <li>
              <a
                href="https://www.facebook.com/groups/dealsinkampala"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                Facebook Group (12K members)
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div
        style={{
          maxWidth: 1200,
          margin: "2rem auto 0",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
          opacity: 0.5,
        }}
      >
        <span>© 2026 DealsInKampala — Part of the Africa Team network.</span>
        <span>Made in Kampala 🇺🇬</span>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        color: "rgba(255,255,255,0.7)",
        textDecoration: "none",
        fontSize: "0.875rem",
      }}
    >
      {children}
    </Link>
  );
}
