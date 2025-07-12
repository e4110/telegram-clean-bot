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
  try {
    // پیام متنی
    if (ctx.channelPost.text) {
      const msg = ctx.channelPost.text;
      
      // الگوی ساده‌تر و قابل اعتماد برای لینک مزاحم n8n
      const unwantedLinkRegex = /This message was sent automatically with n8n\s*\(https?:\/\/[^)]+\)\s*$/;
      
      // حذف فقط لینک مزاحم n8n
      if (unwantedLinkRegex.test(msg)) {
        const cleanMsg = msg.replace(unwantedLinkRegex, "").trim();
        
        console.log("Original message:", msg);
        console.log("Cleaned message:", cleanMsg);
        
        if (cleanMsg.length > 0) {
          await ctx.telegram.sendMessage(channel, cleanMsg, {
            parse_mode: "HTML",
            disable_web_page_preview: false,
          });
        }
      } else {
        console.log("No unwanted link found in text message");
      }
    }

    // کپشن مدیا
    if (ctx.channelPost.caption) {
      const caption = ctx.channelPost.caption;
      const unwantedLinkRegex = /This message was sent automatically with n8n\s*\(https?:\/\/[^)]+\)\s*$/;
      
      if (unwantedLinkRegex.test(caption)) {
        const cleanCaption = caption.replace(unwantedLinkRegex, "").trim();
        
        console.log("Original caption:", caption);
        console.log("Cleaned caption:", cleanCaption);
        
        if (cleanCaption.length > 0) {
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
      } else {
        console.log("No unwanted link found in media caption");
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
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
