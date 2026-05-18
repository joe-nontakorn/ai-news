const axios = require("axios");

/**
 * หมวดหมู่ข่าวและ query ที่ใช้ค้นหา
 */
const NEWS_CATEGORIES = [
  {
    category: "AI & Machine Learning",
    emoji: "🤖",
    q: "artificial intelligence OR machine learning OR LLM OR ChatGPT OR Gemini OR OpenAI OR generative AI",
    pageSize: 5,
  },
  {
    category: "Cloud Computing",
    emoji: "☁️",
    q: "cloud computing OR AWS OR Azure OR Google Cloud OR Kubernetes OR serverless OR cloud infrastructure",
    pageSize: 4,
  },
  {
    category: "Cybersecurity",
    emoji: "🔐",
    q: "cybersecurity OR data breach OR ransomware OR hacking OR vulnerability OR malware OR zero-day",
    pageSize: 4,
  },
  {
    category: "Tech & Semiconductor",
    emoji: "💻",
    q: "semiconductor OR NVIDIA OR Apple OR Microsoft OR startup OR technology earnings OR chip",
    pageSize: 4,
  },
  {
    category: "Dev & Open Source",
    emoji: "👨‍💻",
    q: "programming OR open source OR GitHub OR framework OR TypeScript OR Rust OR Python OR developer tools",
    pageSize: 3,
  },
  {
    category: "DevOps & Infrastructure",
    emoji: "⚙️",
    q: "DevOps OR CI/CD OR Docker OR Kubernetes OR platform engineering OR GitOps OR observability OR SRE",
    pageSize: 3,
  },
  {
    category: "New Devices & Gadgets",
    emoji: "📱",
    q: "launch OR announced OR unveiled OR release OR new device OR smartphone OR laptop OR wearable OR headset OR tablet OR hardware OR gadget",
    pageSize: 3,
  },
];

/**
 * ดึงข่าวแต่ละหมวดพร้อม label หมวดหมู่
 */
async function fetchCategoryNews(category, fromDate) {
  const apiKey = process.env.NEWS_API_KEY;
  try {
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: category.q,
        language: "en",
        sortBy: "publishedAt",
        from: fromDate,
        pageSize: category.pageSize,
        apiKey,
      },
    });

    return (response.data.articles || []).map((a) => ({
      title: a.title,
      description: a.description,
      source: a.source?.name,
      url: a.url,
      publishedAt: a.publishedAt,
      category: category.category,
      emoji: category.emoji,
    }));
  } catch (error) {
    console.error(`❌ Error fetching [${category.category}]:`, error.message);
    return [];
  }
}

/**
 * ดึงข่าวทุกหมวดพร้อมกัน และ deduplicate โดย title
 */
async function fetchTechNews() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const fromDate = yesterday.toISOString().split("T")[0];

  const results = await Promise.all(
    NEWS_CATEGORIES.map((cat) => fetchCategoryNews(cat, fromDate))
  );

  // รวมทุกหมวด แล้ว deduplicate ด้วย title
  const seen = new Set();
  const allArticles = [];
  for (const articles of results) {
    for (const article of articles) {
      const key = article.title?.toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        allArticles.push(article);
      }
    }
  }

  console.log(
    `   🤖 AI: ${results[0].length} | ☁️ Cloud: ${results[1].length} | 🔐 Cyber: ${results[2].length} | 💻 Tech: ${results[3].length} | 👨‍💻 Dev: ${results[4].length} | ⚙️ DevOps: ${results[5].length} | 📱 Devices: ${results[6].length}`
  );
  return allArticles;
}

module.exports = { fetchTechNews };