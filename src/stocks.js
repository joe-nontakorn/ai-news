/**
 * ดึงข้อมูลราคาหุ้นจาก Yahoo Finance (ไม่ต้อง API Key!)
 */
async function fetchStockData() {
  const { default: YahooFinance } = await import("yahoo-finance2");
  const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
  const symbols = (process.env.STOCK_SYMBOLS || "NVDA,AAPL,TSLA,MSFT,GOOGL")
    .split(",")
    .map((s) => s.trim());

  const results = [];

  for (const symbol of symbols) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const quote = await yahooFinance.quote(symbol);

      results.push({
        symbol,
        name: quote.longName || quote.shortName || symbol,
        price: quote.regularMarketPrice?.toFixed(2),
        change: quote.regularMarketChange?.toFixed(2),
        changePercent: quote.regularMarketChangePercent?.toFixed(2),
        open: quote.regularMarketOpen?.toFixed(2),
        high: quote.regularMarketDayHigh?.toFixed(2),
        low: quote.regularMarketDayLow?.toFixed(2),
        volume: quote.regularMarketVolume?.toLocaleString(),
        marketCap: formatMarketCap(quote.marketCap),
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh?.toFixed(2),
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow?.toFixed(2),
      });
    } catch (error) {
      console.error(`❌ Error fetching ${symbol}:`, error.message);
      results.push({ symbol, error: true });
    }
  }

  return results;
}

function formatMarketCap(value) {
  if (!value) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value}`;
}

module.exports = { fetchStockData };
