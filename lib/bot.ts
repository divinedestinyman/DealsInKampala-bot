import { Bot, InlineKeyboard } from "grammy";
import {
  searchDeals,
  findAgentsByArea,
  getAgentAreas,
  countActiveDeals,
  getDealsByTelegram,
  formatDealMd,
  formatAgentMd,
} from "./queries";
import { db } from "./db";
import { deals, commissionRecords } from "./schema";

let _bot: Bot | null = null;

// ─── Deal submission parser ────────────────────────────────────────────────────
// Parses a free-text message that follows the /submit template format.
// Returns null if the message doesn't look like a deal submission.

interface ParsedDeal {
  title: string;
  price: number;
  category: string;
  location: string;
  description: string;
  phone: string | null;
}

const CATEGORY_MAP: Record<string, string> = {
  phone: "phones",   phones: "phones",
  electronic: "electronics", electronics: "electronics",
  laptop: "electronics", computer: "electronics",
  car: "vehicles",   vehicle: "vehicles", vehicles: "vehicles",
  truck: "vehicles", boda: "vehicles",
  house: "property", land: "property", property: "property",
  apartment: "property", plot: "property",
  fashion: "fashion", clothes: "fashion", clothing: "fashion",
  shoes: "fashion",  bag: "fashion",
  home: "home",      furniture: "home",   fridge: "home",
  service: "services", services: "services",
  other: "other",    misc: "other",
};

function parseDealMessage(text: string): ParsedDeal | null {
  const upper = text.toUpperCase();
  if (!upper.includes("TITLE:") || !upper.includes("PRICE:")) return null;

  const get = (key: string): string | null => {
    const regex = new RegExp(`${key}:\\s*(.+)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  const title = get("TITLE") ?? get("ITEM");
  const priceRaw = get("PRICE");
  const locationRaw = get("LOCATION") ?? get("LOC");
  const descRaw = get("DESCRIPTION") ?? get("DESC") ?? get("ABOUT");
  const categoryRaw = get("CATEGORY") ?? get("CAT");
  const phone = get("PHONE") ?? get("CONTACT") ?? get("TEL");

  if (!title || !priceRaw || !locationRaw) return null;

  const priceNum = parseInt(priceRaw.replace(/[^0-9]/g, ""), 10);
  if (isNaN(priceNum) || priceNum < 1000) return null;

  const catKey = (categoryRaw ?? "").toLowerCase().trim();
  const category = CATEGORY_MAP[catKey] ?? "other";

  return {
    title,
    price: priceNum,
    category,
    location: locationRaw,
    description: descRaw ?? title,
    phone: phone ?? null,
  };
}

// ─── Commission parser ─────────────────────────────────────────────────────────
// Parses a reply to the bot's "What was the deal amount?" prompt.

interface ParsedCommission {
  amountUgx: number;
  dealType: "standard" | "high_value";
  sellerName: string;
}

function parseCommissionReply(text: string): ParsedCommission | null {
  const cleaned = text.replace(/[,ugxUGX\s]/g, "").replace(/[^0-9]/g, "");
  const amount = parseInt(cleaned, 10);
  if (isNaN(amount) || amount < 1000) return null;

  // If amount >= 10M UGX treat as high-value (car/land/house)
  const dealType: "standard" | "high_value" = amount >= 10_000_000 ? "high_value" : "standard";

  // Try to extract a seller name after "FROM" or "SELLER:"
  const sellerMatch = text.match(/(?:from|seller:?)\s+(.+)/i);
  const sellerName = sellerMatch ? sellerMatch[1].trim() : "Unknown Seller";

  return { amountUgx: amount, dealType, sellerName };
}

// ─── Bot factory ───────────────────────────────────────────────────────────────

export function getBot(): Bot {
  if (_bot) return _bot;

  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN environment variable is required");

  _bot = new Bot(token);

  // ─── /start ─────────────────────────────────────────────────────────────
  _bot.command("start", async (ctx) => {
    let dealCount = "";
    try {
      const n = await countActiveDeals();
      dealCount = `\n📦 *${n} active listings* live right now\\.\n`;
    } catch {
      // non-critical
    }

    await ctx.reply(
      `👋 Welcome to *DealsInKampala Bot*\\!\n\n` +
        `Uganda's most trusted marketplace — buy and sell safely in Kampala\\.` +
        dealCount +
        `\n*What can I do?*\n` +
        `/search \\[keyword\\] — Find listings\n` +
        `/agents \\[area\\] — Find an escrow agent near you\n` +
        `/submit — List an item for sale\n` +
        `/mydeals — View your active listings\n` +
        `/rate — Rate a seller after a deal\n` +
        `/report — Report a problem or fake listing\n` +
        `/help — Show this menu again\n\n` +
        `💬 Join our community: t\\.me/DealsInKampalaChannel`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // ─── /help ──────────────────────────────────────────────────────────────
  _bot.command("help", async (ctx) => {
    await ctx.reply(
      `*DealsInKampala Bot — Commands*\n\n` +
        `/search \\[keyword\\] — Search listings \\(e\\.g\\. /search iPhone\\)\n` +
        `/agents \\[area\\] — Find nearest agent \\(e\\.g\\. /agents Ntinda\\)\n` +
        `/submit — Submit a new listing\n` +
        `/mydeals — View your active deals\n` +
        `/rate — Rate a completed deal\n` +
        `/report — Report a scam or problem\n\n` +
        `📢 Deal alerts: t\\.me/DealsInKampalaChannel\n` +
        `🌐 Website: dealsinkampala\\.vercel\\.app`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // ─── /agents [area] ─────────────────────────────────────────────────────
  _bot.command("agents", async (ctx) => {
    const query = ctx.match?.trim();

    if (!query) {
      try {
        const areas = await getAgentAreas();
        const areaList =
          areas.length > 0
            ? areas.join(", ").replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`)
            : "Ntinda, Nakawa, Kampala Central";

        await ctx.reply(
          `📍 *Find a payment agent near you*\n\n` +
            `Usage: /agents \\[your area\\]\n` +
            `Example: /agents Ntinda\n\n` +
            `Available areas: ${areaList}\n\n` +
            `_Agents hold your MoMo payment safely until delivery is confirmed\\._`,
          { parse_mode: "MarkdownV2" }
        );
      } catch {
        await ctx.reply(
          `📍 *Find a payment agent near you*\n\n` +
            `Usage: /agents \\[your area\\]\n` +
            `Example: /agents Ntinda\n\n` +
            `_Agents hold your MoMo payment safely until delivery is confirmed\\._`,
          { parse_mode: "MarkdownV2" }
        );
      }
      return;
    }

    try {
      const found = await findAgentsByArea(query);
      const qEsc = query.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`);

      if (found.length === 0) {
        await ctx.reply(
          `❌ No agents found near *${qEsc}*\\.\n\n` +
            `Try a nearby area or use /agents to see all available areas\\.`,
          { parse_mode: "MarkdownV2" }
        );
        return;
      }

      await ctx.reply(`🔍 Found ${found.length} agent\\(s\\) near *${qEsc}*:`, {
        parse_mode: "MarkdownV2",
      });

      for (const agent of found) {
        await ctx.reply(formatAgentMd(agent), { parse_mode: "MarkdownV2" });
      }

      await ctx.reply(
        `_To use an agent: send MoMo to their number, then ask them to confirm via Telegram\\._`,
        { parse_mode: "MarkdownV2" }
      );
    } catch (err) {
      console.error("[/agents] DB error:", err);
      await ctx.reply(
        `⚠️ Could not load agents right now\\. Please try again in a moment\\.`,
        { parse_mode: "MarkdownV2" }
      );
    }
  });

  // ─── /search [keyword] ──────────────────────────────────────────────────
  _bot.command("search", async (ctx) => {
    const keyword = ctx.match?.trim();

    if (!keyword) {
      await ctx.reply(
        `🔍 *Search Listings*\n\n` +
          `Usage: /search \\[keyword\\]\n` +
          `Examples:\n` +
          `• /search iPhone 13\n` +
          `• /search Toyota Premio\n` +
          `• /search 2 bedroom apartment\n\n` +
          `_I'll search our live database of active listings\\._`,
        { parse_mode: "MarkdownV2" }
      );
      return;
    }

    try {
      const results = await searchDeals(keyword);
      const kwEsc = keyword.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`);

      if (results.length === 0) {
        const fbUrl = `https://www.facebook.com/groups/255230365959060/search/?q=${encodeURIComponent(keyword)}`;
        const keyboard = new InlineKeyboard().url(
          `Search "${keyword}" on Facebook`,
          fbUrl
        );
        await ctx.reply(
          `❌ No listings found for *${kwEsc}*\\.\n\nTry a different keyword, or search our Facebook group:`,
          { parse_mode: "MarkdownV2", reply_markup: keyboard }
        );
        return;
      }

      await ctx.reply(
        `🔍 Found *${results.length}* listing\\(s\\) for *${kwEsc}*:`,
        { parse_mode: "MarkdownV2" }
      );

      for (const deal of results.slice(0, 5)) {
        await ctx.reply(formatDealMd(deal), { parse_mode: "MarkdownV2" });
      }

      if (results.length > 5) {
        await ctx.reply(
          `_Showing top 5 of ${results.length} results\\. Narrow your search for more specific results\\._`,
          { parse_mode: "MarkdownV2" }
        );
      }
    } catch (err) {
      console.error("[/search] DB error:", err);
      await ctx.reply(
        `⚠️ Search is temporarily unavailable\\. Please try again in a moment\\.`,
        { parse_mode: "MarkdownV2" }
      );
    }
  });

  // ─── /mydeals ───────────────────────────────────────────────────────────
  _bot.command("mydeals", async (ctx) => {
    const username = ctx.from?.username;

    if (!username) {
      await ctx.reply(
        `📦 *My Deals*\n\n` +
          `To view your deals, set a Telegram username in Settings\\.\n\n` +
          `_Your listings are tracked by your @username when you submit them\\._`,
        { parse_mode: "MarkdownV2" }
      );
      return;
    }

    try {
      const myDeals = await getDealsByTelegram(username);
      const userEsc = username.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`);

      if (myDeals.length === 0) {
        await ctx.reply(
          `📦 *My Deals*\n\n` +
            `No active listings found for @${userEsc}\\.\n\nUse /submit to post your first listing\\!`,
          { parse_mode: "MarkdownV2" }
        );
        return;
      }

      await ctx.reply(`📦 *Your active listings* \\(@${userEsc}\\):`, {
        parse_mode: "MarkdownV2",
      });

      for (const deal of myDeals) {
        await ctx.reply(formatDealMd(deal), { parse_mode: "MarkdownV2" });
      }
    } catch (err) {
      console.error("[/mydeals] DB error:", err);
      await ctx.reply(
        `⚠️ Could not load your deals right now\\. Please try again in a moment\\.`,
        { parse_mode: "MarkdownV2" }
      );
    }
  });

  // ─── /submit ────────────────────────────────────────────────────────────
  // Phase 5: sends a ForceReply template. When the user fills it in and sends
  // it back, the message handler below detects "TITLE:" and inserts to DB.
  _bot.command("submit", async (ctx) => {
    await ctx.reply(
      `📝 *List an Item for Sale*\n\n` +
        `Copy the template below, fill in your details, and send it back to me\\. ` +
        `I'll list it immediately\\.\n\n` +
        `\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\n` +
        `TITLE: \\[item name\\]\n` +
        `PRICE: \\[amount in UGX\\]\n` +
        `CATEGORY: \\[phones / electronics / vehicles / property / fashion / home / services / other\\]\n` +
        `LOCATION: \\[your area in Kampala\\]\n` +
        `DESCRIPTION: \\[brief description, condition\\]\n` +
        `PHONE: \\[your phone number\\]\n` +
        `\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\n\n` +
        `_Prefer the website? Visit dealsinkampala\\.vercel\\.app/submit_`,
      {
        parse_mode: "MarkdownV2",
        reply_markup: { force_reply: true, selective: true },
      }
    );
  });

  // ─── /rate ──────────────────────────────────────────────────────────────
  _bot.command("rate", async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text("⭐ 1", "rate_1")
      .text("⭐⭐ 2", "rate_2")
      .text("⭐⭐⭐ 3", "rate_3")
      .row()
      .text("⭐⭐⭐⭐ 4", "rate_4")
      .text("⭐⭐⭐⭐⭐ 5", "rate_5");

    await ctx.reply(
      `⭐ *Rate Your Deal*\n\nHow was your experience with this seller?\nSelect a rating below:`,
      { parse_mode: "MarkdownV2", reply_markup: keyboard }
    );
  });

  // ─── /rate callback — star selected ──────────────────────────────────────
  // After a star is clicked, ask for the deal amount to log a commission record.
  _bot.callbackQuery(/^rate_(\d)$/, async (ctx) => {
    const stars = parseInt(ctx.match[1]);
    const display = "⭐".repeat(stars);
    await ctx.answerCallbackQuery();

    await ctx.reply(
      `${display} *Thanks for rating\\!*\n\n` +
        `To log a commission record, reply to this message with the *deal amount in UGX*\\.\n` +
        `Example: \`500000\`\n\n` +
        `For high\\-value deals \\(car/land/house\\), amounts ≥ 10M UGX get the 6% rate automatically\\.\n\n` +
        `_Skip this step? Just ignore this message\\._`,
      {
        parse_mode: "MarkdownV2",
        reply_markup: { force_reply: true, selective: true },
      }
    );
  });

  // ─── /report ────────────────────────────────────────────────────────────
  _bot.command("report", async (ctx) => {
    await ctx.reply(
      `🚨 *Report a Problem*\n\n` +
        `Please describe your issue using this format:\n\n` +
        `*REPORT TYPE:* \\[Fake Listing / Scam / No Delivery / Other\\]\n` +
        `*SELLER NAME or PHONE:* \\[if known\\]\n` +
        `*DEAL AMOUNT:* UGX \\[amount\\]\n` +
        `*WHAT HAPPENED:* \\[describe the problem\\]\n` +
        `*EVIDENCE:* \\[attach screenshots if available\\]\n\n` +
        `_All reports are reviewed within 24 hours\\. Fake listings are removed and sellers banned\\._\n\n` +
        `For urgent matters, DM the Facebook page directly\\.`,
      { parse_mode: "MarkdownV2" }
    );
  });

  // ─── Catch-all message handler ───────────────────────────────────────────
  // Handles: deal submissions (TITLE: format), commission replies, unknown messages.
  _bot.on("message:text", async (ctx) => {
    const text = ctx.message.text ?? "";
    const replyTo = ctx.message.reply_to_message;

    // ── Branch 1: Commission amount reply ──────────────────────────────────
    // User is replying to the bot's "reply with deal amount" prompt.
    const isCommissionReply =
      replyTo?.from?.is_bot &&
      (replyTo.text?.toLowerCase().includes("deal amount") ||
        replyTo.text?.toLowerCase().includes("commission record"));

    if (isCommissionReply) {
      const parsed = parseCommissionReply(text);

      if (!parsed) {
        await ctx.reply(
          `❓ I couldn't read that as an amount\\. Please reply with just the number, e\\.g\\. \`500000\`\\.`,
          { parse_mode: "MarkdownV2" }
        );
        return;
      }

      try {
        const agentPct = 0.01;
        const africaPct = parsed.dealType === "high_value" ? 0.05 : 0.01;
        const agentCom = Math.round(parsed.amountUgx * agentPct);
        const africaCom = Math.round(parsed.amountUgx * africaPct);
        const totalCom = agentCom + africaCom;

        const commId = `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await db.insert(commissionRecords).values({
          id: commId,
          dealId: `deal-rated-${Date.now()}`,
          dealDescription: `Deal rated via bot by @${ctx.from?.username ?? ctx.from?.id}`,
          dealType: parsed.dealType,
          agentTelegramId: ctx.from?.username ?? String(ctx.from?.id ?? "unknown"),
          agentName: ctx.from?.first_name ?? "Agent",
          buyerName: "Buyer",
          sellerName: parsed.sellerName,
          amountUgx: parsed.amountUgx,
          agentCommissionUgx: agentCom,
          africaTeamCommissionUgx: africaCom,
          totalCommissionUgx: totalCom,
          paid: false,
        });

        const amt = parsed.amountUgx.toLocaleString("en-UG");
        const agentStr = agentCom.toLocaleString("en-UG");
        const africaStr = africaCom.toLocaleString("en-UG");
        const totalStr = totalCom.toLocaleString("en-UG");

        await ctx.reply(
          `✅ *Commission recorded\\!*\n\n` +
            `💰 Deal amount: UGX ${amt.replace(/,/g, "\\,")}\n` +
            `👤 Agent cut: UGX ${agentStr.replace(/,/g, "\\,")} \\(1%\\)\n` +
            `🏢 Africa Team cut: UGX ${africaStr.replace(/,/g, "\\,")} \\(${parsed.dealType === "high_value" ? "5" : "1"}%\\)\n` +
            `📊 Total commission: UGX ${totalStr.replace(/,/g, "\\,")}\n\n` +
            `_Record ID: ${commId.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`)}_`,
          { parse_mode: "MarkdownV2" }
        );
      } catch (err) {
        console.error("[commission reply] DB error:", err);
        await ctx.reply(
          `⚠️ Could not log the commission right now\\. Please try again\\.`,
          { parse_mode: "MarkdownV2" }
        );
      }
      return;
    }

    // ── Branch 2: Deal submission (TITLE: template filled in) ──────────────
    const parsed = parseDealMessage(text);

    if (parsed) {
      const username = ctx.from?.username;
      const sellerTelegram =
        username ??
        (ctx.from?.first_name ?? "seller")
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_");

      try {
        const dealId = `deal-${Date.now()}`;
        await db.insert(deals).values({
          id: dealId,
          title: parsed.title,
          description: parsed.description,
          price: parsed.price,
          category: parsed.category as "phones" | "electronics" | "vehicles" | "property" | "fashion" | "home" | "services" | "other",
          sellerName: ctx.from?.first_name ?? "Seller",
          sellerTelegram,
          sellerPhone: parsed.phone ?? null,
          location: parsed.location,
          status: "pending",
          featured: false,
          sellerVerified: false,
        });

        const titleEsc = parsed.title.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`);
        const priceStr = parsed.price.toLocaleString("en-UG").replace(/,/g, "\\,");

        await ctx.reply(
          `✅ *Listing submitted for review\\!*\n\n` +
            `*${titleEsc}*\n` +
            `💰 UGX ${priceStr} · 📍 ${parsed.location.replace(/[.!()[\]{}*_~`>#+=|]/g, (c) => `\\${c}`)}\n\n` +
            `Your listing will go live within 2 hours after review\\.\n\n` +
            `📦 Track it with /mydeals once it's approved\\.`,
          { parse_mode: "MarkdownV2" }
        );
      } catch (err) {
        console.error("[deal submit] DB error:", err);
        await ctx.reply(
          `⚠️ Could not save your listing right now\\. Please try again or use dealsinkampala\\.vercel\\.app/submit`,
          { parse_mode: "MarkdownV2" }
        );
      }
      return;
    }

    // ── Branch 3: Unknown message ──────────────────────────────────────────
    await ctx.reply(
      `👋 I didn't understand that\\. Use /help to see all available commands\\.`,
      { parse_mode: "MarkdownV2" }
    );
  });

  return _bot;
}
