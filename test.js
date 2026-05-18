/**
 * test.js — รันทดสอบได้ทันที โดยไม่ต้องรอ cron job
 * คำสั่ง: node test.js
 */
require("dotenv").config();
const { fetchTechNews } = require("./src/news");
const { fetchStockData } = require("./src/stocks");
const { analyzeWithGemini } = require("./src/gemini");
const { sendToDiscord } = require("./src/discord");

async function test() {
  console.log("🧪 โหมดทดสอบ — รันรายงานทันที\n");

  // ตรวจสอบ env variables
  const missing = [];
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("your_")) missing.push("GEMINI_API_KEY");
  if (!process.env.DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL.includes("YOUR_")) missing.push("DISCORD_WEBHOOK_URL");
  if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY.includes("your_")) missing.push("NEWS_API_KEY");

  if (missing.length > 0) {
    console.error("❌ ยังไม่ได้ตั้งค่า:", missing.join(", "));
    console.error("   กรุณาแก้ไขไฟล์ .env ก่อนรัน\n");
    process.exit(1);
  }

  console.log("✅ ตรวจสอบ API Keys ผ่านแล้ว\n");

  console.log("📡 Step 1: ดึงข้อมูล...");
  const [news, stocks] = await Promise.all([fetchTechNews(), fetchStockData()]);
  console.log(`   ข่าว: ${news.length} รายการ`);
  console.log(`   หุ้น: ${stocks.filter((s) => !s.error).length} ตัว`);
  stocks.forEach((s) => {
    if (!s.error) console.log(`   ${s.symbol}: $${s.price} (${s.changePercent}%)`);
  });

  console.log("\n🤖 Step 2: วิเคราะห์ด้วย Gemini...");
  const analysis = await analyzeWithGemini(news, stocks);
  console.log("\n--- ตัวอย่างการวิเคราะห์ ---");
  console.log(analysis.slice(0, 500) + "...\n");

  console.log("📨 Step 3: ส่งไป Discord...");
  await sendToDiscord(analysis, stocks, news.length);

  console.log("\n✅ ทดสอบสำเร็จ! ตรวจดูที่ Discord channel ของคุณ");
}

test().catch(console.error);
