require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;
const channel = process.env.TARGET_CHANNEL;

const n8nFooter = `This message was sent automatically with n8n (https://n8n.io/?utm_source=n8n-internal&utm_medium=powered_by&utm_campaign=n8n-nodes-base.telegram_6868b3da641b9ba94ae834cb695ae7a38dbe61b763f677dc8e1e5f1c90471d9a)`;

// -----------------
// پیام‌های متنی
bot.on("channel_post", async (ctx) => {
  const msg = ctx.channelPost.text;
  if (msg && msg.includes(n8nFooter)) {
    const cleanMsg = msg.replace(n8nFooter, "").trim();
    if (cleanMsg.length > 0 && cleanMsg !== msg) {
      await ctx.telegram.sendMessage(channel, cleanMsg, {
        parse_mode: "HTML",
        disable_web_page_preview: false
      });
    }
  }

  // برای مدیا مثل عکس یا ویدیو با کپشن
  const media = ctx.channelPost.photo || ctx.channelPost.video;
  const caption = ctx.channelPost.caption;
  if (media && caption && caption.includes(n8nFooter)) {
    const cleanCaption = caption.replace(n8nFooter, "").trim();
    if (cleanCaption.length > 0 && cleanCaption !== caption) {
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
    }
  }
});
// -----------------

// راه‌اندازی webhook
app.use(bot.webhookCallback("/bot"));
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/bot`);

app.get("/", (req, res) => {
  res.send("Bot is alive");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
