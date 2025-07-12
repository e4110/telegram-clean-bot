require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 3000;
const channel = process.env.TARGET_CHANNEL;

// Log environment variables for debugging
console.log("Starting bot with configuration:");
console.log("PORT:", PORT);
console.log("TARGET_CHANNEL:", channel);
console.log("BOT_TOKEN exists:", !!process.env.BOT_TOKEN);
console.log("WEBHOOK_URL:", process.env.WEBHOOK_URL);

// -----------------
// پردازش پیام‌های کانال تست
bot.on("channel_post", async (ctx) => {
  try {
    console.log("\n--- New Channel Post Received ---");
    console.log("Message ID:", ctx.channelPost.message_id);
    
    // پیام متنی
    if (ctx.channelPost.text) {
      console.log("Text message detected");
      const msg = ctx.channelPost.text;
      console.log("Original text:", msg);
      
      // روش مطمئن: حذف بر اساس موقعیت متن
      if (msg.includes("This message was sent automatically with n8n")) {
        console.log("Unwanted text detected");
        const cleanMsg = msg.split("This message was sent automatically with n8n")[0].trim();
        console.log("Cleaned text:", cleanMsg);
        
        if (cleanMsg.length > 0) {
          await ctx.telegram.sendMessage(channel, cleanMsg, {
            parse_mode: "HTML",
            disable_web_page_preview: false,
          });
          console.log("Message sent to target channel");
        }
      } else {
        console.log("No unwanted text found - sending original message");
        await ctx.telegram.sendMessage(channel, msg, {
          parse_mode: "HTML",
          disable_web_page_preview: false,
        });
      }
    }

    // کپشن مدیا
    if (ctx.channelPost.caption) {
      console.log("Media with caption detected");
      const caption = ctx.channelPost.caption;
      console.log("Original caption:", caption);
      
      if (caption.includes("This message was sent automatically with n8n")) {
        console.log("Unwanted text in caption detected");
        const cleanCaption = caption.split("This message was sent automatically with n8n")[0].trim();
        console.log("Cleaned caption:", cleanCaption);
        
        if (cleanCaption.length > 0) {
          if (ctx.channelPost.photo) {
            const photo = ctx.channelPost.photo[ctx.channelPost.photo.length - 1].file_id;
            await ctx.telegram.sendPhoto(channel, photo, {
              caption: cleanCaption,
              parse_mode: "HTML",
            });
            console.log("Photo sent to target channel");
          }
          if (ctx.channelPost.video) {
            const video = ctx.channelPost.video.file_id;
            await ctx.telegram.sendVideo(channel, video, {
              caption: cleanCaption,
              parse_mode: "HTML",
            });
            console.log("Video sent to target channel");
          }
        }
      } else {
        console.log("No unwanted text in caption - sending original media");
        if (ctx.channelPost.photo) {
          const photo = ctx.channelPost.photo[ctx.channelPost.photo.length - 1].file_id;
          await ctx.telegram.sendPhoto(channel, photo, {
            caption: caption,
            parse_mode: "HTML",
          });
        }
        if (ctx.channelPost.video) {
          const video = ctx.channelPost.video.file_id;
          await ctx.telegram.sendVideo(channel, video, {
            caption: caption,
            parse_mode: "HTML",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
});
// -----------------

// Setup webhook
app.use(express.json());
app.use(bot.webhookCallback("/bot"));

// Set webhook
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/bot`)
  .then(() => console.log("Webhook set successfully"))
  .catch(err => console.error("Error setting webhook:", err));

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Bot is alive and running");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Log bot info
bot.telegram.getMe().then(botInfo => {
  console.log(`Bot @${botInfo.username} is running`);
});
