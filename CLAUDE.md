# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm start          # Start the bot (cron-based, runs at scheduled time)
npm run dev        # Start with file watching (auto-restart on changes)
npm test           # Run an immediate report (node test.js) — sends to Discord right away
```

> `npm test` / `node test.js` validates all three API keys, fetches live data, runs Gemini analysis, and posts to Discord. Use this to verify end-to-end functionality without waiting for the cron trigger.

## Architecture

The bot follows a linear pipeline triggered once daily by a cron job:

```
index.js (cron scheduler)
  └── runDailyReport()
        ├── src/news.js     → fetchTechNews()   — NewsAPI /v2/everything
        ├── src/stocks.js   → fetchStockData()  — yahoo-finance2 (no API key needed)
        ├── src/gemini.js   → analyzeWithGemini(news, stocks) — Gemini 2.0 Flash
        └── src/discord.js  → sendToDiscord(analysis, stocks, newsCount) — Webhook POST
```

News and stock fetches run in parallel via `Promise.all`. The Gemini analysis receives both datasets and produces a Thai-language report. Discord delivery splits the response into ≤4000-char chunks (Discord embed limit) with a 1-second delay between chunks to avoid rate limits.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | Yes | From aistudio.google.com |
| `DISCORD_WEBHOOK_URL` | Yes | Channel Settings → Integrations → Webhooks |
| `NEWS_API_KEY` | Yes | From newsapi.org (free: 100 req/day) |
| `STOCK_SYMBOLS` | No | Comma-separated Yahoo Finance tickers, default `NVDA,AAPL,TSLA,MSFT,GOOGL` |
| `CRON_SCHEDULE` | No | Local Bangkok cron expression, default `0 8,13 * * *` (8:00 AM & 1:00 PM Bangkok time) |
| `TZ` | No | `Asia/Bangkok` |

## Key Implementation Details

- **Cron timezone**: The cron job runs in the configured timezone, defaulting to `Asia/Bangkok` (Thailand Time), allowing you to schedule times directly in Bangkok time.
- **Gemini model**: `gemini-2.0-flash` (hardcoded in `src/gemini.js:9`). Update here to switch models.
- **Stock data**: Sequential per-symbol fetches (not parallel) inside `fetchStockData` — Yahoo Finance rate-limits concurrent requests.
- **Discord chunking**: `splitText()` in `src/discord.js` splits on newlines to avoid cutting mid-sentence. Only the first chunk gets the embed fields (stock ticker summary); subsequent chunks are plain embeds.
- **Error resilience**: Individual stock fetch failures push `{ symbol, error: true }` and are filtered out downstream rather than aborting the pipeline.
