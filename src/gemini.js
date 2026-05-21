const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 
// System prompt that instructs Gemini how to format the report concisely
const systemPrompt = `
คุณเป็นผู้เชี่ยวชาญด้านการเงินและเทคโนโลยี มีภารกิจสรุปข่าวและหุ้นเป็นรายงานภาษาไทยที่สั้น กระชับ ตรงประเด็น (Concise & Punchy)
- ใช้ Emoji แทนหัวข้อ และไม่ใช้ Markdown headings (#)
- เขียนเนื้อหาแต่ละหัวข้อให้สั้นกระชับที่สุด เน้นสรุปเป็นประเด็นสำคัญในรูปแบบหัวข้อย่อย (Bullet points) หรือประโยคสั้นๆ 1-2 บรรทัด
- หลีกเลี่ยงประโยคยืดยาว คำซ้ำซ้อน และน้ำท่วมทุ่ง
`;

/**
 * ใช้ Gemini วิเคราะห์ข่าวและหุ้น แล้วสรุปเป็นรายงานภาษาไทยแบบสั้นกระชับ
 */
async function analyzeWithGemini(newsArticles, stockData) {
  // ส่ง systemInstruction เพื่อคุมโทนและรูปแบบให้สั้นกระชับ
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt
  });

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

กรุณาวิเคราะห์และสรุปเป็น **รายงานภาษาไทยแบบสั้นและกระชับที่สุด** โดยแบ่งเป็นหัวข้อตามลำดับนี้:

🤖 ข่าว AI & Machine Learning
- เลือกมาเฉพาะ 2-3 ข่าวที่สำคัญที่สุด สรุปข่าวละ 1-2 บรรทัดแบบเข้าใจง่าย (เน้นสาระสำคัญ ใครทำอะไร ผลกระทบคืออะไร)

☁️ ข่าว Cloud & Semiconductor
- เลือก 2 ข่าวสำคัญ สรุปสั้นๆ ข่าวละ 1-2 บรรทัด

🔐 ข่าว Cybersecurity
- เลือก 2 ข่าวที่ต้องระวัง สรุปสั้นๆ ข่าวละ 1-2 บรรทัด (บอกความเสี่ยงและวิธีรับมือสั้นๆ)

👨‍💻 ข่าว Dev & DevOps
- เลือก 1-2 ข่าวเด่นสำหรับนักพัฒนา/Infra สรุปหัวใจสำคัญสั้นๆ 1-2 บรรทัด

📱 อุปกรณ์ IT เปิดตัวใหม่
- เลือก 1-2 อุปกรณ์เด่น บอกจุดเด่นและกลุ่มเป้าหมายสั้นๆ 1-2 บรรทัด

📈 วิเคราะห์หุ้น
- วิเคราะห์ตัวหุ้นแต่ละตัวที่ให้ไปแบบสั้นกระชับที่สุด (จำกัด 1 บรรทัดสั้นๆ ต่อหนึ่งตัวหุ้น)
- ชี้เป้าตัวหุ้นที่น่าสนใจที่สุดวันนี้ 1 ตัวพร้อมเหตุผลสั้นๆ

🔮 มุมมองและคำแนะนำ
- สรุปภาพรวมตลาด โอกาส/ความเสี่ยง และสิ่งที่ต้องติดตามต่อเป็น Bullet point สั้นๆ รวมไม่เกิน 3 ข้อ (ข้อละไม่เกิน 1 บรรทัด)

**กติกาสำคัญมาก**: 
- ห้ามเขียนยาวเด็ดขาด! เน้นกระชับ สั้น ได้ใจความ ไม่ใช้น้ำ 
- ไม่ต้องใส่ Markdown heading (#) ให้ใช้ emoji แทน
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