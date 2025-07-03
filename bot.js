require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const channel = process.env.TARGET_CHANNEL;

bot.on("message", async (ctx) => {
  try {
    const msg = ctx.message.text;

    // فقط اگه پیام متنی داره
    if (msg && msg.includes("This message was sent automatically with n8n")) {
      const cleanMsg = msg.replace(/This message.*n8n.*$/gi, "").trim();
      await ctx.telegram.sendMessage(channel, cleanMsg);
      console.log("✅ Cleaned and forwarded to channel.");
    } else {
      console.log("ℹ️ No cleaning needed or no message text.");
    }
  } catch (err) {
    console.error("❌ Error handling message:", err.message);
  }
});

bot.launch();
console.log("🤖 Bot is running and ready...");
