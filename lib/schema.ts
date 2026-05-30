import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const dealStatusEnum = pgEnum("deal_status", [
  "active",
  "pending",
  "sold",
  "expired",
  "rejected",
]);

export const dealCategoryEnum = pgEnum("deal_category", [
  "phones",
  "electronics",
  "vehicles",
  "property",
  "fashion",
  "home",
  "services",
  "other",
]);

export const dealTypeEnum = pgEnum("deal_type", ["standard", "high_value"]);

export const escrowStatusEnum = pgEnum("escrow_status", [
  "requested",
  "active",
  "completed",
  "cancelled",
]);

// ─── Deals ────────────────────────────────────────────────────────────────────

export const deals = pgTable(
  "deals",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    category: dealCategoryEnum("category").notNull(),
    status: dealStatusEnum("status").notNull().default("active"),
    featured: boolean("featured").notNull().default(false),

    sellerName: text("seller_name").notNull(),
    sellerTelegram: text("seller_telegram").notNull(),
    sellerPhone: text("seller_phone"),
    sellerVerified: boolean("seller_verified").notNull().default(false),

    location: text("location").notNull(),
    photos: text("photos"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at"),
  },
  (t) => [
    index("deals_category_idx").on(t.category),
    index("deals_status_idx").on(t.status),
    index("deals_featured_idx").on(t.featured),
  ]
);

// ─── Agents ───────────────────────────────────────────────────────────────────

export const agents = pgTable(
  "agents",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    telegramHandle: text("telegram_handle").notNull(),
    phone: text("phone"),
    altPhone: text("alt_phone"),
    area: text("area").notNull(),
    division: text("division").notNull(),
    landmark: text("landmark").notNull(),
    verified: boolean("verified").notNull().default(false),
    active: boolean("active").notNull().default(true),
    mtnNumber: text("mtn_number"),
    airtelNumber: text("airtel_number"),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => [
    index("agents_area_idx").on(t.area),
    index("agents_verified_idx").on(t.verified),
  ]
);

// ─── Commission Records ────────────────────────────────────────────────────────

export const commissionRecords = pgTable(
  "commission_records",
  {
    id: text("id").primaryKey(),
    dealId: text("deal_id").notNull(),
    dealDescription: text("deal_description").notNull(),
    dealType: dealTypeEnum("deal_type").notNull(),

    agentTelegramId: text("agent_telegram_id").notNull(),
    agentName: text("agent_name").notNull(),
    buyerName: text("buyer_name").notNull(),
    sellerName: text("seller_name").notNull(),

    amountUgx: integer("amount_ugx").notNull(),
    agentCommissionUgx: integer("agent_commission_ugx").notNull(),
    africaTeamCommissionUgx: integer("africa_team_commission_ugx").notNull(),
    totalCommissionUgx: integer("total_commission_ugx").notNull(),

    paid: boolean("paid").notNull().default(false),
    paidAt: timestamp("paid_at"),

    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  },
  (t) => [
    index("commission_agent_idx").on(t.agentTelegramId),
    index("commission_deal_idx").on(t.dealId),
    index("commission_recorded_idx").on(t.recordedAt),
  ]
);

// ─── Escrow Requests ──────────────────────────────────────────────────────────

export const escrowRequests = pgTable(
  "escrow_requests",
  {
    id: text("id").primaryKey(),
    dealId: text("deal_id").notNull(),
    dealTitle: text("deal_title").notNull(),
    buyerName: text("buyer_name").notNull(),
    buyerPhone: text("buyer_phone").notNull(),
    buyerTelegram: text("buyer_telegram"),
    sellerName: text("seller_name").notNull(),
    sellerTelegram: text("seller_telegram").notNull(),
    agentTelegramId: text("agent_telegram_id"),
    status: escrowStatusEnum("status").notNull().default("requested"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [
    index("escrow_deal_idx").on(t.dealId),
    index("escrow_status_idx").on(t.status),
    index("escrow_agent_idx").on(t.agentTelegramId),
  ]
);

// ─── Type exports ─────────────────────────────────────────────────────────────

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type CommissionRecord = typeof commissionRecords.$inferSelect;
export type NewCommissionRecord = typeof commissionRecords.$inferInsert;
export type EscrowRequest = typeof escrowRequests.$inferSelect;
export type NewEscrowRequest = typeof escrowRequests.$inferInsert;
