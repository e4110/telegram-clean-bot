require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;
const channel = process.env.TARGET_CHANNEL;

bot.on("text", async (ctx) => {
  const msg = ctx.message.text;
  if (msg.includes("This message was sent automatically with n8n")) {
    const cleanMsg = msg.replace(/This message.*n8n/, "").trim();
    await ctx.telegram.sendMessage(channel, cleanMsg);
  }
});

app.use(bot.webhookCallback("/bot"));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/bot`);

app.get("/", (req, res) => {
  res.send("Bot is alive");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
