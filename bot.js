require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const channel = process.env.TARGET_CHANNEL;

bot.on("text", async (ctx) => {
  const msg = ctx.message.text;
  if (msg.includes("This message was sent automatically with n8n")) {
    const cleanMsg = msg.replace(/This message.*n8n/, "").trim();
    await ctx.telegram.sendMessage(channel, cleanMsg);
  }
});

bot.launch();
console.log("🤖 Bot is running...");
