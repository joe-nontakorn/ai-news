const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 
// System prompt that instructs Gemini how to format the report
const systemPrompt = `
คุณเป็นผู้เชี่ยวชาญด้านการเงินและเทคโนโลยี มีภารกิจสรุปข่าวและหุ้นเป็นรายงานภาษาไทย
- ใช้ Emoji แทนหัวข้อ
- ไม่ใช้ Markdown headings
- จัดเรียงข้อมูลให้ครบ 5 ส่วนตามโครงสร้างที่กำหนด
- ให้คะแนนความเสี่ยง 1‑5 และแนะนำการลงทุนต่อจากข้อมูลข่าว
`;
/**
 * ใช้ Gemini วิเคราะห์ข่าวและหุ้น แล้วสรุปเป็นรายงานภาษาไทย
 */
async function analyzeWithGemini(newsArticles, stockData) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // จัดกลุ่มข่าวตาม category เพื่อส่งให้ Gemini เห็นโครงสร้างชัดเจน
  const categories = [
    "AI & Machine Learning",
    "Cloud Computing",
    "Cybersecurity",
    "Tech & Semiconductor",
    "Dev & Open Source",
    "DevOps & Infrastructure",
    "New Devices & Gadgets",
  ];

  const newsByCategory = {};
  for (const cat of categories) {
    newsByCategory[cat] = newsArticles.filter((a) => a.category === cat);
  }

  const newsText = categories
    .map((cat) => {
      const articles = newsByCategory[cat];
      if (!articles || articles.length === 0) return "";
      const emoji = articles[0]?.emoji || "📰";
      const lines = articles
        .map(
          (a, i) =>
            `  ${i + 1}. [${a.source}] ${a.title}\n     ${a.description || ""}`
        )
        .join("\n\n");
      return `${emoji} ${cat}:\n${lines}`;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");

  const stockText = stockData
    .filter((s) => !s.error)
    .map(
      (s) =>
        `${s.symbol} (${s.name}): $${s.price} | เปลี่ยน: ${s.change} (${s.changePercent}%) | High: $${s.high} | Low: $${s.low} | Market Cap: ${s.marketCap}`
    )
    .join("\n");

  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Bangkok",
  });

  const prompt = `
คุณคือนักวิเคราะห์การเงินและเทคโนโลยีมืออาชีพ
วันนี้คือ ${today}

ข่าวเทคโนโลยีล่าสุด (จัดหมวดหมู่แล้ว):
${newsText}

ข้อมูลราคาหุ้น (ปิดตลาดล่าสุด):
${stockText}

กรุณาวิเคราะห์และสรุปเป็น **รายงานภาษาไทย** โดยแบ่งเป็น 5 ส่วน ตามลำดับนี้:

🤖 ข่าว AI & Machine Learning
- เลือก 3-5 ข่าว AI ที่สำคัญที่สุด อธิบายว่าสำคัญอย่างไร ใครได้รับผลกระทบ และแนวโน้มในอนาคต

☁️ ข่าว Cloud Computing
- เลือก 3-5 ข่าว Cloud สำคัญ อธิบายผลกระทบต่อธุรกิจและนักพัฒนา

🔐 ข่าว Cybersecurity
- เลือก 3-5 ข่าว Cyber ที่ต้องระวัง อธิบายความเสี่ยงและวิธีรับมือเบื้องต้น

👨‍💻 ข่าว Dev & Open Source
- เลือก 2-3 ข่าวที่น่าสนใจสำหรับนักพัฒนา เช่น ภาษาใหม่ ไลบรารี framework หรือ GitHub releases

⚙️ ข่าว DevOps & Infrastructure
- เลือก 2-3 ข่าวด้าน CI/CD, Platform Engineering, Observability ที่มีผลต่อ workflow ของทีม

📱 อุปกรณ์ IT เปิดตัวใหม่
- เลือก 2-3 อุปกรณ์หรือ gadget ที่เพิ่งเปิดตัว บอกสเปคเด่น ราคา (ถ้ามี) และน่าซื้อไหม เหมาะกับใคร

📈 วิเคราะห์หุ้น
- วิเคราะห์แต่ละตัวหุ้น: แนวโน้ม, จุดเด่น, ข้อควรระวัง
- หุ้นตัวไหนน่าสนใจที่สุดวันนี้และทำไม
- เชื่อมโยงข่าว AI/Cloud/Cyber กับราคาหุ้นที่เกี่ยวข้อง (เช่น ข่าว AI ดี → NVDA?)

🔮 มุมมองและคำแนะนำ
- ภาพรวมตลาดและเทคโนโลยีวันนี้เป็นอย่างไร
- โอกาสหรือความเสี่ยงที่ควรระวัง
- สิ่งที่ควรติดตามต่อในสัปดาห์นี้

ใช้ภาษาไทยที่เข้าใจง่าย กระชับ แต่ครบถ้วน ไม่ต้องใส่ Markdown heading (#) ให้ใช้ emoji แทน
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini error:", error.message);
    return "⚠️ ไม่สามารถวิเคราะห์ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง";
  }
}

module.exports = { analyzeWithGemini };