# 📊 Daily Market Bot

บอทรายงานข่าวเทคโนโลยี + วิเคราะห์หุ้น US ส่งไป Discord ทุกเช้า 7:00 น.
วิเคราะห์โดย **Google Gemini AI** 🤖

---

## ✨ Features

- 📰 ดึงข่าวเทคโนโลยีล่าสุดจาก NewsAPI (10 ข่าว/วัน)
- 📈 ราคาหุ้น US แบบ Real-time จาก Yahoo Finance (ไม่ต้อง API Key!)
- 🤖 วิเคราะห์เชิงลึกด้วย Gemini AI เป็นภาษาไทย
- 💬 ส่งรายงานสวยงามไปยัง Discord อัตโนมัติทุกเช้า

---

## 🚀 วิธีติดตั้งและใช้งาน

### 1. Clone และติดตั้ง

```bash
git clone <your-repo>
cd news-bot
npm install
```

### 2. ตั้งค่า API Keys

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
GEMINI_API_KEY=your_key_here
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
NEWS_API_KEY=your_key_here
STOCK_SYMBOLS=NVDA,AAPL,TSLA,MSFT,GOOGL
```

### 3. ทดสอบก่อนใช้งานจริง

```bash
node test.js
```

### 4. รันระบบจริง

```bash
npm start
```

---

## 🔑 วิธีรับ API Keys

### Gemini API Key (ฟรี)
1. ไปที่ https://aistudio.google.com
2. คลิก "Get API Key"
3. สร้าง Key ใหม่
4. Copy มาใส่ใน `.env`

### NewsAPI Key (ฟรี 100 req/วัน)
1. ไปที่ https://newsapi.org/register
2. สมัครบัญชีฟรี
3. Copy API Key มาใส่ใน `.env`

### Discord Webhook URL
1. เปิด Discord → เลือก Server และ Channel ที่ต้องการ
2. คลิก ⚙️ Channel Settings
3. ไปที่ Integrations → Webhooks
4. คลิก "New Webhook"
5. ตั้งชื่อ เช่น "Daily Market Bot"
6. คลิก "Copy Webhook URL"
7. ใส่ใน `.env`

---

## 📁 โครงสร้างโปรเจค

```
news-bot/
├── .env                  # API Keys (ห้าม commit!)
├── .env.example          # Template สำหรับ .env
├── .gitignore
├── index.js              # Entry point + Cron Job
├── test.js               # ทดสอบส่งรายงานทันที
├── package.json
└── src/
    ├── news.js           # ดึงข่าวเทคโนโลยี
    ├── stocks.js         # ดึงราคาหุ้น US
    ├── gemini.js         # วิเคราะห์ด้วย Gemini AI
    └── discord.js        # ส่งรายงานไป Discord
```

---

## ⏰ ปรับเวลาส่งรายงาน

ไฟล์ `.env` → แก้ `CRON_SCHEDULE`

| เวลา (ไทย) | CRON_SCHEDULE |
|-----------|--------------|
| 7:00 AM   | `0 0 * * *`  |
| 7:30 AM   | `30 0 * * *` |
| 8:00 AM   | `0 1 * * *`  |
| 9:00 AM   | `0 2 * * *`  |

> **หมายเหตุ**: เซิร์ฟเวอร์รัน UTC ดังนั้น 7:00 AM ไทย = 00:00 UTC

---

## 🌐 Deploy ให้รันตลอด 24 ชั่วโมง

### Railway (แนะนำ — ง่ายที่สุด)
1. Push โค้ดขึ้น GitHub
2. ไปที่ https://railway.app
3. "New Project" → "Deploy from GitHub"
4. เพิ่ม Environment Variables จาก `.env`
5. Deploy!

### Render (ฟรี แต่อาจ sleep)
1. ไปที่ https://render.com
2. "New Web Service" → เชื่อม GitHub
3. Start Command: `node index.js`
4. เพิ่ม Environment Variables

---

## 💡 เพิ่มหุ้นที่ต้องการ

แก้ `.env`:
```env
STOCK_SYMBOLS=NVDA,AAPL,TSLA,MSFT,GOOGL,META,AMZN,AMD
```

รองรับทุก symbol ที่มีใน Yahoo Finance!

---

## 🐛 แก้ปัญหาที่พบบ่อย

**ข่าวไม่ออก**: ตรวจสอบ `NEWS_API_KEY` และ quota ที่ newsapi.org

**หุ้นไม่ออก**: Yahoo Finance อาจ delay ช่วงตลาดปิด ลองรันใหม่

**Discord ไม่ได้รับ**: ตรวจสอบ Webhook URL ให้ถูกต้อง ไม่มี space

**Gemini Error**: ตรวจสอบ API Key และ quota ที่ aistudio.google.com
# ai-news
