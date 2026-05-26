export interface Agent {
  id: string;
  name: string;
  area: string;
  division: string;
  landmark: string;
  mtn: string | null;
  airtel: string | null;
  telegram: string;
  whatsapp: string;
  verified: boolean;
}

// Seed agents — replace with real agents once recruited via Google Form
// Add new agents here until database is wired up
export const AGENTS: Agent[] = [
  {
    id: "agent-001",
    name: "Agent Slot 1",
    area: "Ntinda",
    division: "Nakawa",
    landmark: "Near Ntinda Trading Centre",
    mtn: "077XXXXXXX",
    airtel: null,
    telegram: "@agent001",
    whatsapp: "256077XXXXXXX",
    verified: false,
  },
  {
    id: "agent-002",
    name: "Agent Slot 2",
    area: "Kawempe",
    division: "Kawempe",
    landmark: "Near Kawempe Market",
    mtn: "077XXXXXXX",
    airtel: "070XXXXXXX",
    telegram: "@agent002",
    whatsapp: "256077XXXXXXX",
    verified: false,
  },
  {
    id: "agent-003",
    name: "Agent Slot 3",
    area: "Makindye",
    division: "Makindye",
    landmark: "Opposite Makindye Police Station",
    mtn: null,
    airtel: "070XXXXXXX",
    telegram: "@agent003",
    whatsapp: "256070XXXXXXX",
    verified: false,
  },
];

export function findAgentsByArea(query: string): Agent[] {
  const q = query.toLowerCase();
  return AGENTS.filter(
    (a) =>
      a.area.toLowerCase().includes(q) ||
      a.division.toLowerCase().includes(q) ||
      a.landmark.toLowerCase().includes(q)
  );
}

export function formatAgent(agent: Agent): string {
  const badge = agent.verified ? "✅ VERIFIED" : "🔵 AGENT";
  const mtn = agent.mtn ? `MTN: ${agent.mtn}` : "";
  const airtel = agent.airtel ? `Airtel: ${agent.airtel}` : "";
  const money = [mtn, airtel].filter(Boolean).join(" | ");

  return [
    `${badge} — ${agent.name}`,
    `📍 ${agent.area}, ${agent.division}`,
    `🏢 ${agent.landmark}`,
    `💳 ${money}`,
    `📱 Telegram: ${agent.telegram}`,
    `📞 WhatsApp: wa.me/${agent.whatsapp}`,
  ].join("\n");
}
