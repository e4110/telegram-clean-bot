require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;
const channel = process.env.TARGET_CHANNEL;

// -----------------
// پردازش پیام‌های کانال تست
bot.on("channel_post", async (ctx) => {
  const msg = ctx.channelPost.text;

  // لینک مزاحم انتهایی
  const unwantedLinkRegex = /This message was sent automatically with n8n.*$/s;

  // حذف فقط اون لینک خاص
  if (msg && unwantedLinkRegex.test(msg)) {
    const cleanMsg = msg.replace(unwantedLinkRegex, "").trim();

    if (cleanMsg.length > 0 && cleanMsg !== msg) {
      await ctx.telegram.sendMessage(channel, cleanMsg, {
        parse_mode: "HTML",
        disable_web_page_preview: false,
      });
    }
  }

  // کپشن مدیا مثل عکس یا ویدیو
  const media = ctx.channelPost.photo || ctx.channelPost.video;
  const caption = ctx.channelPost.caption;

  if (media && caption && unwantedLinkRegex.test(caption)) {
    const cleanCaption = caption.replace(unwantedLinkRegex, "").trim();

    if (cleanCaption.length > 0 && cleanCaption !== caption) {
      if (ctx.channelPost.photo) {
        const photo = ctx.channelPost.photo[ctx.channelPost.photo.length - 1].file_id;
        await ctx.telegram.sendPhoto(channel, photo, {
          caption: cleanCaption,
          parse_mode: "HTML",
        });
      }
      if (ctx.channelPost.video) {
        const video = ctx.channelPost.video.file_id;
        await ctx.telegram.sendVideo(channel, video, {
          caption: cleanCaption,
          parse_mode: "HTML",
        });
      }
    }
  }
});
// -----------------

app.use(bot.webhookCallback("/bot"));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/bot`);

app.get("/", (req, res) => {
  res.send("Bot is alive");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
