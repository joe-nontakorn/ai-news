const axios = require("axios");

/**
 * ส่งรายงานไปยัง Discord ผ่าน Webhook
 */
async function sendToDiscord(analysis, stockData, newsCount) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.includes("YOUR_WEBHOOK")) {
    console.error("❌ กรุณาตั้งค่า DISCORD_WEBHOOK_URL ใน .env");
    return;
  }

  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Bangkok",
  });

  // สร้าง Stock Summary สั้นๆ สำหรับ embed fields
  const stockFields = stockData
    .filter((s) => !s.error)
    .slice(0, 5)
    .map((s) => {
      const isPositive = parseFloat(s.changePercent) >= 0;
      const arrow = isPositive ? "🟢" : "🔴";
      const sign = isPositive ? "+" : "";
      return {
        name: `${arrow} ${s.symbol}`,
        value: `**$${s.price}**\n${sign}${s.changePercent}% (${sign}${s.change})`,
        inline: true,
      };
    });

  // แบ่ง analysis ออกเป็นหลาย chunk ถ้ายาวเกิน 4096 ตัวอักษร
  const chunks = splitText(analysis, 4000);

  // Message แรก - embed หลัก
  const mainPayload = {
    username: "📊 Daily Market Bot",
    avatar_url:
      "https://cdn.discordapp.com/attachments/placeholder/bot-avatar.png",
    embeds: [
      {
        title: `🌅 รายงานประจำวัน — ${today}`,
        description: chunks[0],
        color: 0x00d4aa, // สีเขียวน้ำทะเล
        fields: stockFields,
        footer: {
          text: `📰 ข่าว ${newsCount} รายการ • ข้อมูลจาก Yahoo Finance & NewsAPI • วิเคราะห์โดย Gemini AI`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(webhookUrl, mainPayload);
    console.log("✅ ส่ง Discord embed หลักสำเร็จ");

    // ส่ง chunk ที่เหลือ (ถ้ามี)
    for (let i = 1; i < chunks.length; i++) {
      await delay(1000); // หน่วง 1 วิ ป้องกัน rate limit
      await axios.post(webhookUrl, {
        username: "📊 Daily Market Bot",
        embeds: [
          {
            description: chunks[i],
            color: 0x00d4aa,
          },
        ],
      });
      console.log(`✅ ส่ง chunk ${i + 1}/${chunks.length} สำเร็จ`);
    }
  } catch (error) {
    console.error(
      "❌ Discord webhook error:",
      error.response?.data || error.message
    );
  }
}

function splitText(text, maxLength) {
  if (text.length <= maxLength) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLength;
    if (end < text.length) {
      // ตัดที่ newline ใกล้ที่สุด
      const lastNewline = text.lastIndexOf("\n", end);
      if (lastNewline > start) end = lastNewline;
    }
    chunks.push(text.slice(start, end).trim());
    start = end + 1;
  }
  return chunks;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { sendToDiscord };
