require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;
const channel = process.env.TARGET_CHANNEL; // مثال: '@LiveTetherPrice'

// پیام‌های متنی کانال
bot.on("channel_post", async (ctx) => {
  const msg = ctx.channelPost.text;

  if (msg && msg.includes("This message was sent automatically with n8n")) {
    const cleanMsg = msg.replace(/This message.*n8n.*/s, "").trim();
    if (cleanMsg.length > 0 && cleanMsg !== msg) {
      try {
        await ctx.telegram.sendMessage(channel, cleanMsg, {
          parse_mode: "HTML" // مهم برای حفظ لینک‌ها
        });
      } catch (err) {
        console.error("خطا در ارسال پیام متنی:", err.message);
      }
    }
  }

  // پیام‌های مدیا (عکس یا ویدیو) با کپشن
  const media = ctx.channelPost.photo || ctx.channelPost.video;
  const caption = ctx.channelPost.caption;

  if (media && caption && caption.includes("This message was sent automatically with n8n")) {
    const cleanCaption = caption.replace(/This message.*n8n.*/s, "").trim();

    try {
      if (ctx.channelPost.photo) {
        const photo = ctx.channelPost.photo[ctx.channelPost.photo.length - 1].file_id;
        await ctx.telegram.sendPhoto(channel, photo, {
          caption: cleanCaption,
          parse_mode: "HTML"
        });
      }

      if (ctx.channelPost.video) {
        const video = ctx.channelPost.video.file_id;
        await ctx.telegram.sendVideo(channel, video, {
          caption: cleanCaption,
          parse_mode: "HTML"
        });
      }
    } catch (err) {
      console.error("خطا در ارسال پیام مدیا:", err.message);
    }
  }
});

// راه‌اندازی وب‌هوک
app.use(bot.webhookCallback("/bot"));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/bot`);

app.get("/", (req, res) => {
  res.send("🤖 Bot is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
