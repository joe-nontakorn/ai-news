require("dotenv").config();
const http = require("http");
const cron = require("node-cron");
const { fetchTechNews } = require("./src/news");
const { fetchStockData } = require("./src/stocks");
const { analyzeWithGemini } = require("./src/gemini");
const { sendToDiscord } = require("./src/discord");

/**
 * ฟังก์ชันหลัก: รวบรวมข้อมูล → วิเคราะห์ → ส่ง Discord
 */
async function runDailyReport() {
  console.log("\n🚀 เริ่มสร้างรายงานประจำวัน...");
  console.log("⏰", new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }));

  try {
    // Step 1: ดึงข้อมูลพร้อมกัน
    console.log("\n📡 กำลังดึงข้อมูล...");
    const [news, stocks] = await Promise.all([
      fetchTechNews(),
      fetchStockData(),
    ]);

    console.log(`✅ ดึงข่าวได้ ${news.length} รายการ`);
    console.log(`✅ ดึงข้อมูลหุ้นได้ ${stocks.filter((s) => !s.error).length} ตัว`);

    if (news.length === 0 && stocks.every((s) => s.error)) {
      console.error("❌ ไม่มีข้อมูลเลย หยุดการทำงาน");
      return;
    }

    // Step 2: วิเคราะห์ด้วย Gemini
    console.log("\n🤖 กำลังวิเคราะห์ด้วย Gemini AI...");
    const analysis = await analyzeWithGemini(news, stocks);
    console.log("✅ วิเคราะห์เสร็จแล้ว");

    // Step 3: ส่งไป Discord
    console.log("\n📨 กำลังส่งรายงานไป Discord...");
    await sendToDiscord(analysis, stocks, news.length);

    console.log("\n🎉 รายงานประจำวันเสร็จสมบูรณ์!\n");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
  }
}

// ===== CRON JOB =====
// ค่า default: ส่ง 2 เวลา คือ 08:00 และ 13:00 เวลาไทย (Asia/Bangkok)
const schedule = process.env.CRON_SCHEDULE || "0 8,13 * * *";
const tz = process.env.TZ || "Asia/Bangkok";

console.log("🤖 Daily Market Bot เริ่มทำงานแล้ว!");
console.log(`⏰ ตั้งเวลาส่งรายงาน: ${schedule} (${tz})`);
console.log("📌 หุ้นที่ติดตาม:", process.env.STOCK_SYMBOLS || "NVDA,AAPL,TSLA,MSFT,GOOGL");

cron.schedule(schedule, runDailyReport, {
  timezone: tz,
});

// ===== รันทดสอบทันทีตอนเริ่ม (comment ออกถ้าไม่ต้องการ) =====
// runDailyReport();

console.log('\n💡 Tip: ถ้าอยากทดสอบทันที ให้รัน: node test.js\n');

// ===== HEALTH CHECK SERVER =====
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  const packageJson = require("./package.json");
  res.end(JSON.stringify({ status: "ok", bot: "Daily Market Bot", version: packageJson.version, uptime: Math.floor(process.uptime()) }));
}).listen(PORT, () => {
  console.log(`🌐 Health check server running on port ${PORT}`);
});
