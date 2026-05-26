// Run after deploying to Vercel:
// npx tsx scripts/setup-webhook.ts

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!BOT_TOKEN || !WEBHOOK_URL || !WEBHOOK_SECRET) {
  console.error("Missing required env vars: BOT_TOKEN, WEBHOOK_URL, WEBHOOK_SECRET");
  process.exit(1);
}

const webhookEndpoint = `${WEBHOOK_URL}/api/webhook`;

async function setup() {
  console.log(`Setting webhook to: ${webhookEndpoint}`);

  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookEndpoint,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query"],
      }),
    }
  );

  const data = await res.json();

  if (data.ok) {
    console.log("✅ Webhook registered successfully");
    console.log(`   URL: ${webhookEndpoint}`);
  } else {
    console.error("❌ Failed to set webhook:", data.description);
    process.exit(1);
  }

  // Verify
  const info = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
  ).then((r) => r.json());

  console.log("\nWebhook info:");
  console.log(`  URL: ${info.result.url}`);
  console.log(`  Pending updates: ${info.result.pending_update_count}`);
  console.log(`  Last error: ${info.result.last_error_message ?? "none"}`);
}

setup();
